import { useContext, useEffect, useState } from 'react';
import { axiosClientJSON } from '../endpoint';
import { FileExplorerContext } from '../FileExplorer';
import { buttonStyle } from '../utils/constants';
import { getFolderId } from '../utils/utils';

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

	useEffect(() => {
		console.log(files, folders);
	}, [files, folders]);

	useEffect(() => {
		console.log({ filtered });
	}, [filtered]);

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
			<a title="share">
				<span className={buttonStyle}>drive_file_rename_outline</span>
			</a>
			<a title="delete">
				<span className={buttonStyle}>delete</span>
			</a>
		</div>
	);
};

export default FilesOptions;
