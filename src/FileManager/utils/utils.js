import { assetsEndpoint } from '../endpoint';
import _update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { toastAutoClose } from './constants';
import axios from 'axios';

export const uploadFiles = async (files, folderId, axiosClientJSON) => {
	if (files.length == 0) return;

	const defaultChunkSize = 10000000; // 10MB
	const maxAmtOfChunks = 10000; // s3 only allows 10,000 chunks
	let toastId = null;

	try {
		let response;
		let totalNumChunks = 0;
		let currentChunk = 0;
		let filesPromisesArray = [];

		toastId = toast('Upload in Progress', {
			progress: 0.01,
			hideProgressBar: false,
			progressClassName: 'bg-conditional-color',
		});

		response = await axiosClientJSON.get(`/requestBatchUpload`, {
			params: { folderId },
		});
		const { batchId } = response.data;

		for (let i = 0; i < files.length; i++) {
			const totalFileSize = files[i].size;
			totalNumChunks += Math.min(
				Math.floor(totalFileSize / defaultChunkSize) + 1,
				maxAmtOfChunks
			);
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileSize = file.size;
			let chunkSize = defaultChunkSize;

			let numChunks = Math.floor(fileSize / chunkSize) + 1;
			if (numChunks > maxAmtOfChunks) {
				numChunks = maxAmtOfChunks;
				chunkSize = Math.floor(fileSize / (maxAmtOfChunks - 1));
			}

			const { filepath, webkitRelativePath, name, type } = file;
			let filePath = filepath ? filepath : webkitRelativePath; // filepath is what the drag and drop package uses, webkitRelativePath is what the files input for folders uses
			filePath = filePath.slice(0, -(name.length + 1)); // removes the end of the filePath that is the / + name + fileExtension, ie /fileName.txt
			const ext = name.split('.').pop();
			const storedName = uuidv4();

			response = await axiosClientJSON.get(`/startUpload`, {
				params: {
					storedName,
					type,
				},
			});
			const { uploadId } = response.data;

			let promisesArray = [];
			let start, end, blob;

			for (let index = 1; index < numChunks + 1; index++) {
				start = (index - 1) * chunkSize;
				end = index * chunkSize;
				blob = file.slice(start, end);

				// (1) Generate presigned URL for each part
				let getUploadUrlResp = await axiosClientJSON.get(`/getUploadUrl`, {
					params: {
						storedName,
						partNumber: index,
						uploadId,
					},
				});

				let { presignedUrl } = getUploadUrlResp.data;

				// (2) Puts each file part into the storage server
				let uploadResp = axios.put(presignedUrl, blob, {
					headers: { 'Content-Type': file.type },
				});
				uploadResp.then((res) => {
					currentChunk++;
					const progress = Math.min(currentChunk / totalNumChunks, 0.99); // changing toast type to error when the progress was set to 1, causes the toast to immediately close for some reason, dirty fix

					toast.update(toastId, {
						progress,
					});
				});
				// console.log('   Upload no ' + index + '; Etag: ' + uploadResp.headers.etag)
				promisesArray.push(uploadResp);
				filesPromisesArray.push(uploadResp);
			}

			Promise.all(promisesArray).then(async (resolvedArray) => {
				let uploadPartsArray = [];
				resolvedArray.forEach((resolvedPromise, index) => {
					uploadPartsArray.push({
						ETag: resolvedPromise.headers.etag,
						PartNumber: index + 1,
					});
				});

				// (3) Calls the CompleteMultipartUpload endpoint in the backend server

				await axiosClientJSON.post(`/completeUpload`, {
					storedName,
					parts: uploadPartsArray,
					uploadId,
					filePath,
					batchId,
					name,
					type,
				});
			});
		}

		await Promise.all(filesPromisesArray);

		response = await axiosClientJSON.post(`/completeBatchUpload`, {
			batchId,
			folderId,
		});

		toast.update(toastId, {
			render: 'Uploaded Successfully',
			type: toast.TYPE.SUCCESS,
			hideProgressBar: true,
			// autoClose: toastAutoClose,
		});
	} catch (e) {
		toast.update(toastId, {
			render: errorRender({
				msg: 'Upload failed',
				data: e,
			}),
			type: toast.TYPE.ERROR,
			hideProgressBar: true,
			// autoClose: toastAutoClose,
		});
	} finally {
		// auto close wasnt working
		setTimeout(() => {
			// .done wasnt working for some reason
			toast.dismiss(toastId);
		}, toastAutoClose);
	}
};

export const update = _update; // does not allow vs code importing because it is not a named export, this makes it easier

export const getFolderId = ({ tabsState, activeTabId, rootUserFolderId }) => {
	const path = tabsState[activeTabId].path;
	let folderId = path[path.length - 1];
	if (folderId === 'Home') {
		return rootUserFolderId;
	} else {
		return folderId;
	}
};

export const createBuckets = ({
	records,
	files,
	folders,
	fileExtensionsMap,
}) => {
	const bucket = {};

	const _bucketPush = (bucketName, groupName, item) => {
		if (!bucket[bucketName]) {
			bucket[bucketName] = {};
		}
		if (!bucket[bucketName][groupName]) {
			bucket[bucketName][groupName] = [];
		}
		bucket[bucketName][groupName].push(item);
	};
	const _earlierThisYear = (valDate) => {
		const min = new Date();
		min.setMonth(0);
		min.setDate(1);
		min.setHours(0, 0, 0, 0);
		return valDate > min;
	};

	const _lastMonth = (valDate) => {
		const min = new Date();
		min.setMonth(min.getMonth() - 1);
		min.setDate(1);
		min.setHours(0, 0, 0, 0);
		const max = new Date();
		max.setDate(1);
		max.setHours(0, 0, 0, 0);
		return valDate > min && valDate < max;
	};

	const _earlierThisMonth = (valDate) => {
		const d = new Date();
		d.setDate(1);
		d.setHours(0, 0, 0, 0);
		return valDate > d;
	};

	const _lastWeek = (valDate) => {
		const max = new Date();
		let day;
		day = max.getDay();
		max.setHours(0, 0, 0, 0);
		max.setDate(max.getDate() - day);

		const min = new Date();
		day = min.getDay();
		min.setHours(0, 0, 0, 0);
		min.setDate(min.getDate() - day - 7);

		// within last week AND in this month
		return (
			valDate > min && valDate < max && min.getMonth() === valDate.getMonth()
		);
	};

	const _earlierThisWeek = (valDate) => {
		const d = new Date();
		const day = d.getDay();
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() - day);
		return valDate > d;
	};

	const _yesterday = (valDate) => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		return valDate.toDateString() === d.toDateString();
	};

	const _today = (valDate) => {
		const d = new Date();
		return valDate.toDateString() === d.toDateString();
	};

	records.forEach((item) => {
		const { id, __typename } = item;

		const file = files.find((file) => file.id === id);
		const folder = folders.find((folder) => folder.id === id);

		if (
			(__typename == 'file' && !file) ||
			(__typename == 'folder' && !folder)
		) {
			return bucket;
		}

		// name
		let name;
		if (__typename === 'file') {
			name = file.name;
		} else {
			name = folder.name;
		}
		_bucketPush('name', name.charAt(0).toUpperCase() + '...', item);

		// type
		if (__typename === 'file') {
			const { name } = file;
			const fileType = name.split('.').pop();
			const fileTypeFullName = fileExtensionsMap[fileType]?.fullName;
			if (fileTypeFullName) {
				_bucketPush('type', fileTypeFullName, item);
			} else {
				_bucketPush('type', fileType.toUpperCase() + ' File', item);
			}
		} else {
			_bucketPush('type', 'File folder', item);
		}

		// date
		// a week is treated as beginning on sunday and ending on saturday
		dateVariations.forEach((currDateVariation) => {
			let _date;
			if (__typename === 'file') {
				_date = file.meta[currDateVariation];
			} else {
				_date = folder.meta[currDateVariation];
			}
			const date = new Date(_date);
			if (_today(date)) {
				_bucketPush(currDateVariation, 'Today', item);
			} else if (_yesterday(date)) {
				_bucketPush(currDateVariation, 'Yesterday', item);
			} else if (_earlierThisWeek(date)) {
				_bucketPush(currDateVariation, 'Earlier this week', item);
			} else if (_lastWeek(date)) {
				_bucketPush(currDateVariation, 'Last week', item);
			} else if (_earlierThisMonth(date)) {
				_bucketPush(currDateVariation, 'Earlier this month', item);
			} else if (_lastMonth(date)) {
				_bucketPush(currDateVariation, 'Last Month', item);
			} else if (_earlierThisYear(date)) {
				_bucketPush(currDateVariation, 'Earlier this year', item);
			} else {
				_bucketPush(currDateVariation, 'A long time ago', item);
			}
		});

		// size
		if (__typename === 'file') {
			const k = 1024;
			const { size } = file;

			if (size === 0) {
				_bucketPush('size', 'Empty (0KB)', item);
			} else if (size <= 16 * k) {
				_bucketPush('size', 'Tiny (0 - 16 KB)', item);
			} else if (size <= k * k) {
				_bucketPush('size', 'Small (16KB - 1 MB)', item);
			} else if (size <= 128 * k * k) {
				_bucketPush('size', 'Medium (1 - 128 MB)', item);
			} else if (size <= k * k * k) {
				_bucketPush('size', 'Large (128 MB - 1 GB)', item);
			} else if (size <= 4 * k * k * k) {
				_bucketPush('size', 'Huge (1 - 4 GB)', item);
			} else {
				_bucketPush('size', 'Gigantic (> 4GB)', item);
			}
		} else {
			_bucketPush('size', 'Unspecified', item);
		}
	});

	return bucket;
};

export const formatBytes = (bytes, decimals = 2) => {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const dateVariations = ['created', 'modified', 'lastAccessed'];

export const camelCaseToPhrase = (s) => {
	s = s.replace(/([A-Z])/g, ' $1').trim(); // Insert space before capital letters
	s = s.toLowerCase();
	s = s.charAt(0).toUpperCase() + s.slice(1); // capitalize first letter
	return s;
};

export const rootNavigationArray = ['Home', 'Shared with me', 'Recycle bin'];

export const openInNewTab = ({
	tabsState,
	tabId,
	setActiveTabId,
	setTabsState,
	newTabState,
}) => {
	const { order } = tabsState[tabId];

	let newTabsState = Object.fromEntries(
		Object.entries(tabsState).map(([key, value]) => {
			return [
				key,
				{
					...value,
					order: value.order > order ? value.order + 1 : value.order,
				},
			];
		})
	);

	const uuid = uuidv4();
	newTabsState[uuid] = {
		...newTabState,
		order: order + 1,
	};

	setActiveTabId(uuid);
	setTabsState(newTabsState);
};

export const canEdit = ({ tabsState, activeTabId, sharedAccessType }) => {
	const { path } = tabsState[activeTabId];
	if (path[0] === 'Recycle bin') return false;
	if (path[0] === 'Shared with me' && path.length === 1) return false;
	if (path[0] === 'Shared with me' && sharedAccessType === 'VIEW') return false;
	return true;
};

export const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const decapitalizeFirstLetter = (string) => {
	return string.charAt(0).toLowerCase() + string.slice(1);
};

const defaultSortOrGroupOrder = (column) => {
	if (dateVariations.includes(column)) return -1; // default ordering for dates is descending
	return 1;
};

export const setLocalStorageFolderSpecific = ({
	prev,
	curr,
	localStorage,
	setLocalStorage,
	path,
}) => {
	const obj = { ...prev };
	const { sortBy, sortOrder, groupBy, groupOrder } = obj;
	const [key, value] = Object.entries(curr)[0];

	if (key === 'groupBy' && groupBy === value) {
		obj.groupOrder = groupOrder * -1;
	} else if (key === 'groupBy' && groupBy !== value) {
		obj.groupBy = value;
		obj.groupOrder = defaultSortOrGroupOrder(value);
	} else if (key === 'sortBy' && sortBy === value) {
		obj.sortOrder = sortOrder * -1;
	} else if (key === 'sortBy' && sortBy !== value) {
		obj.sortBy = value;
		obj.sortOrder = defaultSortOrGroupOrder(value);
	} else {
		// no special conditions met
		obj[key] = value;
	}

	setLocalStorage(
		update(localStorage, {
			folderSpecific: {
				$merge: {
					[path]: obj,
				},
			},
		})
	);
};

export const isMobile = () => {
	const { userAgent } = window.navigator;
	if (userAgent.match(/Windows Phone/i)) {
		return true;
	}
	// some mobile IE browser
	if (userAgent.match(/iemobile/i)) {
		return true;
	}
	if (userAgent.match(/android/i)) {
		return true;
	}
	if (userAgent.match(/iphone/i)) {
		return true;
	}
	return false;
};

export const isMacOs = () => {
	return window.navigator.userAgent.toLowerCase().includes('mac');
};

export const shortcutHintGenerate = (hint) => {
	if (isMobile()) return '';
	if (isMacOs()) {
		return hint.replaceAll('Ctrl', 'Cmd').replaceAll('Alt', 'Option');
	}
	return hint;
};

export const shortcutHotkeyGenerate = (shortcut) => {
	const macShortcut = shortcut
		.replaceAll('ctrl', 'command')
		.replaceAll('alt', 'option');
	if (macShortcut !== shortcut) {
		return shortcut + ', ' + macShortcut;
	}
	return shortcut;
};

export const rgbAddA = (rgb, a) => {
	const rgbSplit = rgb.replace('rgb', 'rgba').split(')');
	rgbSplit.pop();
	return rgbSplit.join(')') + ',' + a + ')';
};

const isValidHexColor = (color) => {
	return /^#[0-9A-F]{6}$/i.test(color);
};

export const hexToRgb = (hex) => {
	if (!isValidHexColor(hex)) return null;
	let newHex = hex.substring(1);
	if (newHex.length !== 6) {
		throw 'Only six-digit hex colors are allowed.';
	}

	var aRgbHex = newHex.match(/.{1,2}/g);
	const r = parseInt(aRgbHex[0], 16);
	const g = parseInt(aRgbHex[1], 16);
	const b = parseInt(aRgbHex[2], 16);
	return `rgb(${r},${g},${b})`;
};

export const errorRender = ({ msg, data }) => {
	const { errors } = data?.response?.data ?? {};
	if (errors) {
		const expectedServerErrors = errors.filter((error) => !error.extensions);
		if (expectedServerErrors.length > 0) {
			return `${msg}, ${decapitalizeFirstLetter(
				expectedServerErrors[0].message
			)}`;
		}
	}

	return msg;
};

export const getAssets = (asset) => {
	return assetsEndpoint + '/' + asset;
};
