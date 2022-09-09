import { getFilesFromDataTransferItems } from 'datatransfer-files-promise';
import { useState } from 'react';
import { uploadFiles } from '../utils/utils';

// https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree/53058574#53058574
const FileUploadDiv = (props) => {
	const { children, parentFolderId } = props;
	const [draggedOver, setDraggedOver] = useState(false);

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
		let files = await getFilesFromDataTransferItems(e.dataTransfer.items);
		uploadFiles(files, parentFolderId);
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
