import { getFilesFromDataTransferItems } from 'datatransfer-files-promise';
import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../FileExplorer';
import { canEdit, uploadFiles } from '../utils/utils';

// https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree/53058574#53058574
const FileUploadDiv = ({ children, folderId, style }) => {
	const {
		localStorage,
		setLocalStorage,
		tabsState,
		activeTabId,
		sharedAccessType,
	} = useContext(FileExplorerContext);
	const [draggedOver, setDraggedOver] = useState(false);
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const temp = canEdit({ tabsState, activeTabId, sharedAccessType });
		setEnabled(temp);
	}, [tabsState[activeTabId].path]);

	const handleOnDragOver = (e) => {
		if (enabled) {
			e.preventDefault();
			e.stopPropagation(); // prevents triggering another dragover border highlight, if this FileUploadDiv is nested in another FileuploadDiv
			setDraggedOver(true);
		}
	};

	const handleOnDragLeave = (e) => {
		if (enabled) {
			e.preventDefault();
			setDraggedOver(false);
		}
	};

	const handleOnDrop = async (e) => {
		if (enabled) {
			e.preventDefault();
			e.stopPropagation(); // prevents triggering another dragover border highlight, if this FileUploadDiv is nested in another FileuploadDiv
			setDraggedOver(false);
			let files = await getFilesFromDataTransferItems(e.dataTransfer.items);
			uploadFiles(files, folderId);
		}
	};

	return (
		<div
			className={
				'p-1 w-fit h-fit border-dashed border ' +
				(enabled && draggedOver ? 'border-green-500' : 'border-transparent')
			}
			style={style}
			onDragOver={handleOnDragOver}
			onDragLeave={handleOnDragLeave}
			onDrop={handleOnDrop}
		>
			{children}
		</div>
	);
};

export default FileUploadDiv;
