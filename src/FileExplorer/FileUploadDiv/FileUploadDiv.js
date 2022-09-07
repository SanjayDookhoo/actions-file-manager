import { useState } from 'react';

// https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree/53058574#53058574
const FileUploadDiv = (props) => {
	const { children } = props;
	const [draggedOver, setDraggedOver] = useState(false);

	// Drop handler function to get all files
	async function getAllFileEntries(dataTransferItemList) {
		let fileEntries = [];
		// Use BFS to traverse entire directory/file structure
		let queue = [];
		// Unfortunately dataTransferItemList is not iterable i.e. no forEach
		for (let i = 0; i < dataTransferItemList.length; i++) {
			// Note webkitGetAsEntry a non-standard feature and may change
			// Usage is necessary for handling directories
			queue.push(dataTransferItemList[i].webkitGetAsEntry());
		}
		while (queue.length > 0) {
			let entry = queue.shift();
			if (entry.isFile) {
				fileEntries.push(entry);
			} else if (entry.isDirectory) {
				let reader = entry.createReader();
				queue.push(...(await readAllDirectoryEntries(reader)));
			}
		}
		return fileEntries;
	}

	// Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
	async function readAllDirectoryEntries(directoryReader) {
		let entries = [];
		let readEntries = await readEntriesPromise(directoryReader);
		while (readEntries.length > 0) {
			entries.push(...readEntries);
			readEntries = await readEntriesPromise(directoryReader);
		}
		return entries;
	}

	// Wrap readEntries in a promise to make working with readEntries easier
	async function readEntriesPromise(directoryReader) {
		try {
			return await new Promise((resolve, reject) => {
				directoryReader.readEntries(resolve, reject);
			});
		} catch (err) {
			console.log(err);
		}
	}

	const handleOnDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation(); // prevents triggering another dragover border highlight, if this FileUploadDiv is nested in another FileuploadDiv
		setDraggedOver(true);
	};

	const handleOnDragLeave = (e) => {
		e.preventDefault();
		setDraggedOver(false);
	};

	const handleOnDrop = async (e) => {
		e.preventDefault();
		e.stopPropagation(); // prevents triggering another dragover border highlight, if this FileUploadDiv is nested in another FileuploadDiv
		setDraggedOver(false);
		let items = await getAllFileEntries(e.dataTransfer.items);
		console.log(items);
	};

	return (
		<div
			className={
				'm-1 p-1 w-full h-full border-dashed border ' +
				(draggedOver ? 'border-green-500' : 'border-transparent')
			}
			onDragOver={handleOnDragOver}
			onDragLeave={handleOnDragLeave}
			onDrop={handleOnDrop}
		>
			{children}
		</div>
	);
};

export default FileUploadDiv;
