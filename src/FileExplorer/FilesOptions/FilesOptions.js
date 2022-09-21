import { Fragment, useContext, useEffect, useState } from 'react';
import FileFocusableItem from '../CustomReactMenu/FileFocusableItem';
import { axiosClientJSON } from '../endpoint';
import { FileExplorerContext } from '../FileExplorer';
import { buttonStyle } from '../utils/constants';
import { getFolderId, update } from '../utils/utils';

const FilesOptions = ({ item }) => {
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
		setSharingLinksIsOpen,
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

	const handleShare = () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		let record;

		// find record
		if (selectedFolders.length != 0) {
			record = folders.find((folder) => folder.id == selectedFolders[0]);
		} else {
			record = files.find((file) => file.id == selectedFiles[0]);
		}
		setSharingLinksIsOpen(record);
	};

	const buttonList = [
		{
			title: 'cut',
			onClick: handleCut,
			icon: 'cut',
		},
		{
			title: 'copy',
			onClick: handleCopy,
			icon: 'content_copy',
		},
		{
			title: 'paste',
			onClick: handlePaste,
			icon: 'content_paste',
		},
		{
			title: 'rename',
			onClick: handleRename,
			icon: 'drive_file_rename_outline',
		},
		{
			title: 'share',
			onClick: handleShare,
			icon: 'share',
		},
		{
			title: 'delete',
			onClick: handleDelete,
			icon: 'delete',
		},
	];

	return (
		<>
			{buttonList.map(({ title, onClick, icon }) => (
				<Fragment key={title}>
					{item ? (
						<FileFocusableItem title={title} icon={icon} onClick={onClick} />
					) : (
						<a title={title} onClick={onClick}>
							<span className={buttonStyle}>{icon}</span>
						</a>
					)}
				</Fragment>
			))}
		</>
	);
};

export default FilesOptions;
