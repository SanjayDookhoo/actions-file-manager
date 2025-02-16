/**
 * StreamFetcher was created for the purpose of increasing the download speed of files and a zip of files.
 * For a single large file download, the limit for linode is around 10 MB/s. But multiple parts can be fetched
 * simultaneously, which can then be put together to increase the download speed.
 *
 * Google Chrome as of this point, allows 6 simultaneous requests at one point in time. Because of this, there is
 * max of 6 times increase in download speed.
 *
 * Simultaneously this logic can be applied to the ZIP creation on the frontend. The original implementation with
 * using fetch for multiple resources to be zipped did seem to have some concurrency if it is done for multiple files.
 * The concurrency is in the form of getting the different files simultaneously. Unfortunately this did not seem
 * very reliable, sometimes a couple of the downloads will pause, while only one is finalized.
 *
 * This StreamFetcher also hopes to fix that, it allows up to 10 concurrent promises (still limited by the browser
 * allowed concurrency, just a number chosen), where the fetch is done in the order the files was provided. For
 * example, a large file could have 100 parts that will be downloaded first, at the rate of 10 parts, when that file
 * has finished downloading all its parts, the download starts for the next file, and its stream is then utilized.
 * The sequential order of the files downloading is necessary because the ZIP can only be written to sequentially.
 *
 * overall: higher download rate than the initial implementation, utilizing the ability to download in parts
 * sequentially
 *
 * If a download cannot be completed due to an error from one of the links while downloading, the original
 * remained showing and attempting to continue the download. This method allows for a gracefully failing after
 * retrying multiple times with a slight delay in the retry
 *
 * Known limitations and issues:
 * 		- Because the data is piped as it is gotten in chunks, the browsers estimated ETA until completion
 * 		  tends to fluctuate at around 10 seconds for the most
 *
 * Implemented on version 2.0.6 https://github.com/jimmywarting/StreamSaver.js
 *
 * Upgrading notes. The creator suggested using his other project native-file-system-adapter, but from this
 * https://github.com/jimmywarting/native-file-system-adapter?tab=readme-ov-file#a-note-when-downloading-with-the-polyfilled-version
 * it seems that this version implements storing in RAM before saving, at least sometimes, because I want to avoid this
 * I will continue to use this current version, also this version is not yet Deprecated
 */

const maxConcurrentPromises = 10;
const maxRetries = 3;
const retryDelayInSeconds = 1;

export class StreamFetcher {
	constructor(args = {}) {
		const { baseChunkSize = 1 * 1024 * 1024, beforeUnloadCb } = args;
		this.queue = {};
		this.readers = [];
		this.baseChunkSize = baseChunkSize;
		this.abortController = new AbortController();
		this.isAborted = false;
		this.beforeUnloadEvent = beforeUnloadCb
			? (event) => beforeUnloadHandler(event, beforeUnloadCb)
			: null;
	}

	getBeforeUnloadEvent() {
		return this.beforeUnloadEvent;
	}

	// optional contentLength can be passed in
	async enqueueFetch(url, contentLength = null) {
		const queueObj = { currentOffset: 0, contentLength, url }; // and cancelWait added later
		const id = crypto.randomUUID();
		this.queue[id] = queueObj;

		const self = this;

		return new ReadableStream({
			async pull(controller) {
				// wait until the array has promises related to self fetch
				await new Promise(async (resolve, reject) => {
					queueObj.cancelWait = resolve;
				});

				// Ensure there are active promises
				while (
					Object.keys(self.queue).includes(id) &&
					self.readers.length > 0
				) {
					const reader = self.readers[0];

					// Wait for the current promise to complete
					const chunk = await reader.promise;

					// Enqueue the completed chunk
					controller.enqueue(chunk);

					// Remove the completed reader
					self.readers.shift();

					// finished streaming file
					if (reader.end == queueObj.contentLength - 1) {
						delete self.queue[id];
						if (Object.keys(self.queue).length != 0) {
							// unpause next in queue
							Object.values(self.queue)[0].cancelWait();
						}
						controller.close(); // Close the stream when all readers are processed
					}

					// Add a new reader if there are remaining bytes
					await self._downloadNext();
				}
			},
			cancel() {
				self.abort();
			},
		});
	}

	abort() {
		window.removeEventListener('beforeunload', this.beforeUnloadEvent);
		this.isAborted = true;
		this.abortController.abort('aborted');
	}

	async fetchAll() {
		if (!this.beforeUnloadEvent) {
			throw new Error(
				'beforeUnloadCb must be passed in to StreamFetcher constructor, it is required to inform the user that a "Save is in Progress" '
			);
		}

		window.addEventListener('beforeunload', this.beforeUnloadEvent);

		// Fill initial readers
		while (
			this.readers.length < maxConcurrentPromises &&
			(await this._downloadNext())
		) {}

		// start the first stream
		if (Object.keys(this.queue).length != 0) {
			Object.values(this.queue)[0].cancelWait();
		}
	}

	async _downloadNext() {
		let currentInQueueKey;
		let currentInQueueValue;

		if (this.isAborted) return 0;
		if (Object.keys(this.queue).length == 0) {
			// is finished properly
			window.removeEventListener('beforeunload', this.beforeUnloadEvent);
			return 0;
		}

		if (this.readers.length == 0 && Object.entries(this.queue).length != 0) {
			// fetch the first one
			[currentInQueueKey, currentInQueueValue] = Object.entries(this.queue)[0];
		}
		if (this.readers.length != 0) {
			const reader = this.readers[this.readers.length - 1];
			currentInQueueKey = reader.queueId;
			currentInQueueValue = this.queue[currentInQueueKey];
			// fetching current finished
			if (reader.end == currentInQueueValue.contentLength - 1) {
				// check to see if another file is in this.queue to download
				const queueKeys = Object.keys(this.queue);
				const currentIndexInQueue = queueKeys.findIndex(
					(x) => x == currentInQueueKey
				);
				if (currentIndexInQueue < queueKeys.length - 1) {
					const newQueueKey = queueKeys[currentIndexInQueue + 1];
					currentInQueueKey = newQueueKey;
					currentInQueueValue = this.queue[currentInQueueKey];
				} else {
					return 0;
				}
			}
			// else continue with current
		}

		// currentInQueueValue.contentLength could be assigned as 0
		if (currentInQueueValue.contentLength == null) {
			try {
				// Fetch the file size
				const headResponse = await fetch(currentInQueueValue.url, {
					method: 'HEAD',
				});

				currentInQueueValue.contentLength = parseInt(
					headResponse.headers.get('Content-Length'),
					10
				);

				if (isNaN(currentInQueueValue.contentLength)) {
					this.abort();
					throw new Error('Failed to retrieve file size, file may not exists');
				}
			} catch (e) {
				this.abort();
				throw new Error('Failed to retrieve file size, file may not exists');
			}
		}

		let randomChunkSize;

		if (currentInQueueValue.contentLength == 0) {
			randomChunkSize = 0;
		} else {
			randomChunkSize =
				this.baseChunkSize +
				Math.floor(Math.random() * (this.baseChunkSize / 2));
		}
		const start = currentInQueueValue.currentOffset;
		const end = Math.min(
			currentInQueueValue.currentOffset + randomChunkSize - 1,
			currentInQueueValue.contentLength - 1
		);

		const reader = createReader(
			currentInQueueValue.url,
			start,
			end,
			this.baseChunkSize,
			currentInQueueKey
		);
		this.readers.push(reader);

		let retries = 0;
		const tryFetch = () => {
			this._fetchRange(currentInQueueValue.url, start, end)
				.then((data) => {
					// @ts-ignore
					reader.resolvePromise(new Uint8Array(data));
				})
				.catch((err) => {
					console.error('Fetch failed:', err);
					if (retries < maxRetries) {
						setTimeout(() => {
							tryFetch();
						}, 1000 * retryDelayInSeconds);
					} else {
						this.abort();
						// @ts-ignore
						reader.resolvePromise(null); // triggers browser to cancel download
					}
					retries++;
				});
		};
		tryFetch();

		currentInQueueValue.currentOffset += randomChunkSize;

		return 1;
	}

	async _fetchRange(url, start, end) {
		const config = { signal: this.abortController.signal };

		if (end != -1) {
			config.headers = {
				Range: `bytes=${start}-${end}`,
			};
		}
		const response = await fetch(url, config);

		// used to test retry by randomly causing a failure of fetch
		// if (Math.random() < 0.1) {
		// 	// 10% chance
		// 	throw new Error(
		// 		`Failed to fetch range ${start}-${end}: ${response.statusText}`
		// 	);
		// }

		if (!response.ok && response.status !== 206) {
			throw new Error(
				`Failed to fetch range ${start}-${end}: ${response.statusText}`
			);
		}

		return response.arrayBuffer();
	}

	// ****************
}

// Helper function to create a reader object
const createReader = (url, start, end, baseChunkSize, queueId) => {
	let resolvePromise;
	const promise = new Promise((resolve) => {
		resolvePromise = resolve;
	});

	const randomChunkSize =
		baseChunkSize + Math.floor(Math.random() * (baseChunkSize / 2));
	return {
		promise,
		resolvePromise,
		url,
		start,
		end,
		randomChunkSize,
		queueId,
	};
};

const beforeUnloadHandler = (event, beforeUnloadCb) => {
	// Recommended
	event.preventDefault();

	beforeUnloadCb();

	// Included for legacy support, e.g. Chrome/Edge < 119
	event.returnValue = true;
};

export const getZipSize = (toDownload) => {
	let emptyZipFileSize = 22; // byte size of an empty zip file
	const headersAndFootersConstant = 92;
	let sumRelevantToEachFile = 0;
	for (const item of toDownload) {
		sumRelevantToEachFile +=
			item.contentLength +
			item.name.length * 2 + // for some reason the "name" of the file takes 2 bytes
			headersAndFootersConstant;
	}
	return emptyZipFileSize + sumRelevantToEachFile;
};

export const streamSaverSave = ({
	fileStream,
	readableStream,
	onFinishedCb,
}) => {
	// more optimized
	if (window.WritableStream && readableStream.pipeTo) {
		return readableStream.pipeTo(fileStream).then(() => {
			console.log('done writing');
			// finished properly
			if (onFinishedCb) {
				onFinishedCb();
			}
		});
	}

	// less optimized
	const writer = fileStream.getWriter();
	const reader = readableStream.getReader();
	const pump = () =>
		reader.read().then((res) => {
			if (res.done) {
				console.log('also done writing');
				// finished properly
				if (onFinishedCb) {
					onFinishedCb();
				}
				writer.close();
			} else {
				writer.write(res.value).then(pump);
			}
		});
	pump();
};
