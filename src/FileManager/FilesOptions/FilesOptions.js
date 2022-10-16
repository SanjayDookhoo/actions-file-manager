import { Fragment, useContext, useEffect, useState } from 'react';
import FileFocusableItem from '../CustomReactMenu/FileFocusableItem';
import DeleteRestoreConfirmation from '../DeleteRestoreConfirmation';
import { axiosClientJSON } from '../endpoint';
import { FileManagerContext } from '../FileManager';
import SharingLinks from '../SharingLinks';
import { buttonStyle } from '../utils/constants';
import {
	getFolderId,
	shortcutHotkeyGenerate,
	shortcutHintGenerate,
	update,
} from '../utils/utils';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-toastify';

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
		rootUserFolderId,
	} = useContext(FileManagerContext);

	const isActive = (title) => {
		const { selectedFolders, selectedFiles, path } = tabsState[activeTabId];

		const map = {
			Cut: () => {
				if (path[0] == 'Shared with me' && path.length == 1) return false;
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin' && path.length != 1) return false; // only allowed at the top level of recycle bin
				return selectedFolders.length + selectedFiles.length != 0;
			},
			Copy: () => {
				if (path[0] == 'Recycle bin') return false; // not allowed at all in recycle bin folder
				return selectedFolders.length + selectedFiles.length != 0;
			},
			Paste: () => {
				if (path[0] == 'Shared with me' && path.length == 1) return false;
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin') return false;
				return paste;
			},
			Rename: () => {
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin') return false;
				return selectedFolders.length + selectedFiles.length == 1;
			},
			Share: () => {
				if (path[0] == 'Shared with me') return false;
				if (path[0] == 'Recycle bin') return false;
				return selectedFolders.length + selectedFiles.length == 1;
			},
			Delete: () => {
				if (path[0] == 'Shared with me' && path.length == 1) return false;
				if (path[0] == 'Shared with me' && sharedAccessType == 'VIEW')
					return false;
				if (path[0] == 'Recycle bin' && path.length != 1) return false;
				return selectedFolders.length + selectedFiles.length != 0;
			},
		};
		return map[title]();
	};

	// enabled: !item, check is necessary so only one instance of this shortcut is created, because this component is reused
	useHotkeys(
		shortcutHotkeyGenerate('f2'),
		() => handleRename(),
		{
			enabled: !item && isActive('Rename'),
		},
		[tabsState, activeTabId]
	);
	useHotkeys(
		shortcutHotkeyGenerate('ctrl+x'),
		() => handleCut(),
		{
			enabled: !item && isActive('Cut'),
		},
		[tabsState, activeTabId]
	);
	useHotkeys(
		shortcutHotkeyGenerate('ctrl+c'),
		() => handleCopy(),
		{
			enabled: !item && isActive('Copy'),
		},
		[tabsState, activeTabId]
	);
	useHotkeys(
		shortcutHotkeyGenerate('ctrl+v'),
		() => handlePaste(),
		{
			enabled: !item && isActive('Paste'),
		},
		[tabsState, activeTabId, rootUserFolderId]
	);
	// key combination: "del, delete" both works for a single key press in windows, causing handleDelete to execute twice, using "delete" for both windows and mac
	useHotkeys(
		shortcutHotkeyGenerate('delete'),
		() => handleDelete(),
		{
			enabled: !item && isActive('Delete'),
		},
		[tabsState, activeTabId]
	);

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
		const count = selectedFiles.length + selectedFolders.length;
		const str = `${count} Item${count != 1 ? 's' : ''}`;
		toast.promise(res, {
			pending: `${str} cutting to clipboard`,
			success: `${str} cut to clipboard`,
			error: `${str} failed to cut to clipboard`,
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
		const count = selectedFiles.length + selectedFolders.length;
		const str = `${count} Item${count != 1 ? 's' : ''}`;
		toast.promise(res, {
			pending: `${str} copying to clipboard`,
			success: `${str} copied to clipboard`,
			error: `${str} failed to copy to clipboard`,
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
			const res = axiosClientJSON({
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

			const count = selectedFiles.length + selectedFolders.length;
			const str = `${count} item${count != 1 ? 's' : ''}`;

			toast.promise(res, {
				pending: `Moving ${str} to recycle bin`,
				success: `Moved ${str} to recycle bin`,
				error: `Failed to move ${str} to recycle bin`,
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
			componentProps: { record },
		});
	};

	const buttonList = [
		{
			title: 'Cut',
			shortcutHint: 'Ctrl+X',
			onClick: handleCut,
			icon: 'cut',
		},
		{
			title: 'Copy',
			shortcutHint: 'Ctrl+C',
			onClick: handleCopy,
			icon: 'content_copy',
		},
		{
			title: 'Paste',
			shortcutHint: 'Ctrl+V',
			onClick: handlePaste,
			icon: 'content_paste',
		},
		{
			title: 'Rename',
			shortcutHint: 'F2',
			onClick: handleRename,
			icon: 'drive_file_rename_outline',
		},
		{
			title: 'Share',
			onClick: handleShare,
			icon: 'share',
		},
		{
			title: 'Delete',
			// shortcutHint: 'Del',
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
				.map(({ title, onClick, icon, shortcutHint }) => (
					<Fragment key={title}>
						{item ? (
							<>
								{isActive(title) && (
									<FileFocusableItem
										title={
											title +
											(shortcutHint
												? shortcutHintGenerate(` (${shortcutHint})`)
												: '')
										}
										icon={icon}
										onClick={onClick}
									/>
								)}
							</>
						) : (
							<a
								className={'hover ' + (isActive(title) ? '' : 'disabled')}
								title={
									title +
									(shortcutHint
										? shortcutHintGenerate(` (${shortcutHint})`)
										: '')
								}
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
