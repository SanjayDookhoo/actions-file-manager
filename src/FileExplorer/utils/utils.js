import { axiosClientFiles } from "../endpoint";

export const uploadFiles = (files) => {
	if (files.length > 0) {
		// TODO: upload files to backend
		let formData = new FormData();
		const filesPath = [];
		// the files are not stored in a normal array
		for (let i = 0; i < files.length; i++) {
			const { filepath, webkitRelativePath, name } = files[i];
			formData.append('file', files[i] );
			let filePath = filepath ? filepath : webkitRelativePath // filepath is what the drag and drop package uses, webkitRelativePath is what the files input for folders uses
			filePath = filePath.slice(0, -(name.length + 1)); // removes the end of the filePath that is the / + name + fileExtension, ie /fileName.txt
			filesPath.push(filePath);
		}
		formData.append('filesPath', JSON.stringify(filesPath));

		const res = axiosClientFiles({
			url: '/upload',
			method: 'POST',
			data: formData,
		});
		// console.log(res);
	}
}