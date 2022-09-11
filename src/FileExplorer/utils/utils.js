import { axiosClientFiles } from '../endpoint';
import _update from 'immutability-helper';

export const uploadFiles = (files, folderId) => {
	if (files.length > 0) {
		// TODO: upload files to backend
		let formData = new FormData();
		const filesPath = [];
		// the files are not stored in a normal array
		for (let i = 0; i < files.length; i++) {
			const { filepath, webkitRelativePath, name } = files[i];
			formData.append('file', files[i]);
			let filePath = filepath ? filepath : webkitRelativePath; // filepath is what the drag and drop package uses, webkitRelativePath is what the files input for folders uses
			filePath = filePath.slice(0, -(name.length + 1)); // removes the end of the filePath that is the / + name + fileExtension, ie /fileName.txt
			filesPath.push(filePath);
		}
		formData.append('filesPath', JSON.stringify(filesPath));
		formData.append('folderId', folderId);

		const res = axiosClientFiles({
			url: '/upload',
			method: 'POST',
			data: formData,
		});
		// console.log(res);
	}
};

export const update = _update; // does not allow vs code importing because it is not a named export, this makes it easier

export const getFolderId = ({ tabsState, activeTabId }) => {
	const path = tabsState[activeTabId].path;
	let folderId = path[path.length - 1];
	folderId = Number.isInteger(folderId) ? folderId : null;
	return folderId;
};
