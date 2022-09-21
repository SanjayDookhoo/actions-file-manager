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
		paste,
		setPaste,
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
		setPaste('cut');
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
		setPaste('copy');
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
		if (paste == 'cut') setPaste(null);
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

	const isActive = (title) => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];

		const map = {
			cut: () => {
				return selectedFolders.length + selectedFiles.length != 0;
			},
			copy: () => {
				return selectedFolders.length + selectedFiles.length != 0;
			},
			paste: () => {
				return paste;
			},
			rename: () => {
				return selectedFolders.length + selectedFiles.length == 1;
			},
			share: () => {
				return selectedFolders.length + selectedFiles.length == 1;
			},
			delete: () => {
				return selectedFolders.length + selectedFiles.length != 0;
			},
		};
		return map[title]();
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
						<>
							{isActive(title) && (
								<FileFocusableItem
									title={title}
									icon={icon}
									onClick={onClick}
								/>
							)}
						</>
					) : (
						<a
							className={
								isActive(title) ? '' : 'pointer-events-none text-gray-400'
							}
							title={title}
							onClick={onClick}
						>
							<span className={buttonStyle}>{icon}</span>
						</a>
					)}
				</Fragment>
			))}
		</>
	);
};

export default FilesOptions;
