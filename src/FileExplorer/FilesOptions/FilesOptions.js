import { Fragment, useContext, useEffect, useState } from 'react';
import FileFocusableItem from '../CustomReactMenu/FileFocusableItem';
import DeleteRestoreConfirmation from '../DeleteRestoreConfirmation';
import { axiosClientJSON } from '../endpoint';
import { FileExplorerContext } from '../FileExplorer';
import SharingLinks from '../SharingLinks';
import { buttonStyle } from '../utils/constants';
import { getFolderId, update } from '../utils/utils';

const FilesOptions = ({ item, buttonsToFilter }) => {
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
		handlePaste,
		sharedAccessType,
		setModal,
	} = useContext(FileExplorerContext);

	const handleCut = () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		const res = axiosClientJSON({
			url: '/cut',
			method: 'POST',
			data: {
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
				selectedFolders,
				selectedFiles,
			},
		});
		setPaste('copy');
	};

	const handleRename = () => {
		setTabsState(
			update(tabsState, { [activeTabId]: { renaming: { $set: true } } })
		);
	};

	const handleDelete = async () => {
		const { selectedFolders, selectedFiles, path } = tabsState[activeTabId];
		if (path[0] == 'Recycle bin') {
			setModal({
				isOpen: true,
				component: DeleteRestoreConfirmation,
				componentProps: {
					type: 'permanentlyDelete',
					data: {
						selectedFolders,
						selectedFiles,
					},
					setTabsState,
					tabsState,
					activeTabId,
				},
			});
		} else {
			axiosClientJSON({
				url: '/remove',
				method: 'POST',
				data: {
					selectedFolders,
					selectedFiles,
				},
			}).then((res) => {
				setTabsState(
					update(tabsState, {
						[activeTabId]: {
							selectedFiles: { $set: [] },
							selectedFolders: { $set: [] },
						},
					})
				);
			});
		}
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
		setModal({
			isOpen: true,
			component: SharingLinks,
			componentProps: record,
		});
	};

	const isActive = (title) => {
		const { selectedFolders, selectedFiles, path } = tabsState[activeTabId];

		const map = {
			cut: () => {
				if (path[0] == 'Shared with me' && path.length == 1) return false;
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin' && path.length != 1) return false; // only allowed at the top level of recycle bin
				return selectedFolders.length + selectedFiles.length != 0;
			},
			copy: () => {
				if (path[0] == 'Recycle bin') return false; // not allowed at all in recycle bin folder
				return selectedFolders.length + selectedFiles.length != 0;
			},
			paste: () => {
				if (path[0] == 'Shared with me' && path.length == 1) return false;
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin') return false;
				return paste;
			},
			rename: () => {
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin') return false;
				return selectedFolders.length + selectedFiles.length == 1;
			},
			share: () => {
				if (path[0] == 'Shared with me') return false;
				if (path[0] == 'Recycle bin') return false;
				return selectedFolders.length + selectedFiles.length == 1;
			},
			delete: () => {
				if (path[0] == 'Shared with me' && path.length == 1) return false;
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin' && path.length != 1) return false;
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
			{buttonList
				.filter(({ title }) =>
					buttonsToFilter ? buttonsToFilter.includes(title) : true
				)
				.map(({ title, onClick, icon }) => (
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
