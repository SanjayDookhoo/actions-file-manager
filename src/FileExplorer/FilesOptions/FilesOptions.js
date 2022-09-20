import { useContext, useEffect, useState } from 'react';
import { axiosClientJSON } from '../endpoint';
import { FileExplorerContext } from '../FileExplorer';
import { buttonStyle } from '../utils/constants';
import { getFolderId, update } from '../utils/utils';

const FilesOptions = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		files,
		folders,
		fileExtensionsMap,
		setFolderArguments,
		setFileArguments,
		filtered,
		setFiltered,
	} = useContext(FileExplorerContext);

	const handleCut = () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		const res = axiosClientJSON({
			url: '/cut',
			method: 'POST',
			data: {
				userId: '123',
				selectedFolders,
				selectedFiles,
			},
		});
	};

	const handleCopy = () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		const res = axiosClientJSON({
			url: '/copy',
			method: 'POST',
			data: {
				userId: '123',
				selectedFolders,
				selectedFiles,
			},
		});
	};

	const handlePaste = () => {
		const folderId = getFolderId({ tabsState, activeTabId });
		const res = axiosClientJSON({
			url: '/paste',
			method: 'POST',
			data: {
				userId: '123',
				folderId,
			},
		});
	};

	const handleRename = () => {
		setTabsState(
			update(tabsState, { [activeTabId]: { renaming: { $set: true } } })
		);
	};

	const handleDelete = async () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		const res = await axiosClientJSON({
			url: '/remove',
			method: 'POST',
			data: {
				selectedFolders,
				selectedFiles,
			},
		});
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: [] },
					selectedFolders: { $set: [] },
				},
			})
		);
	};

	return (
		<div className="flex">
			<a title="cut" onClick={handleCut}>
				<span className={buttonStyle}>cut</span>
			</a>
			<a title="copy" onClick={handleCopy}>
				<span className={buttonStyle}>content_copy</span>
			</a>
			<a title="paste" onClick={handlePaste}>
				<span className={buttonStyle}>content_paste</span>
			</a>
			<a title="rename" onClick={handleRename}>
				<span className={buttonStyle}>drive_file_rename_outline</span>
			</a>
			<a title="delete">
				<span className={buttonStyle} onClick={handleDelete}>
					delete
				</span>
			</a>
		</div>
	);
};

export default FilesOptions;
