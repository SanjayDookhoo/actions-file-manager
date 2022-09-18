import { useContext, useEffect, useState } from 'react';
import { formatBytes, update } from '../../../../../utils/utils';
import { FileExplorerContext } from '../../../../../FileExplorer';
import DetailsLayout from './DetailsLayout';
import TilesLayout from './TilesLayout';
import IconsLayout from './IconsLayout';

const Layout = ({ record }) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		fileExtensionsMap,
	} = useContext(FileExplorerContext);

	const handleSelectFileFolderOnClick = (e, record) => {
		const { id, __typename } = record;
		e.stopPropagation(); // allows empty space to be clicked to clear all folders or files selected
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		let tempSelectedFolders;
		let tempSelectedFiles;

		if (__typename == 'Folder') {
			if (!localStorage.multiselect) {
				tempSelectedFolders = [id];
				tempSelectedFiles = [];
			} else {
				tempSelectedFiles = selectedFiles;
				if (selectedFolders.includes(id)) {
					tempSelectedFolders = [...selectedFolders];
					const index = tempSelectedFolders.findIndex((el) => el == id);
					tempSelectedFolders.splice(index, 1);
				} else {
					tempSelectedFolders = [...selectedFolders, id];
				}
			}
		} else if (__typename == 'File') {
			if (!localStorage.multiselect) {
				tempSelectedFiles = [id];
				tempSelectedFolders = [];
			} else {
				tempSelectedFolders = selectedFolders;
				if (selectedFiles.includes(id)) {
					tempSelectedFiles = [...selectedFiles];
					const index = tempSelectedFiles.findIndex((el) => el == id);
					tempSelectedFiles.splice(index, 1);
				} else {
					tempSelectedFiles = [...selectedFiles, id];
				}
			}
		}

		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: tempSelectedFiles },
					selectedFolders: { $set: tempSelectedFolders },
				},
			})
		);
	};

	const updateCurrentFolderId = (folderId) => {
		const { paths, currentIndex } = tabsState[activeTabId].history;
		const newPath = [...tabsState[activeTabId].path, folderId];
		let newPaths = [...paths];
		newPaths = newPaths.splice(0, currentIndex + 1);
		newPaths = [...newPaths, newPath];
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					// adding path in a way that allows keeping track of history
					path: { $set: newPath },
					history: {
						paths: { $set: newPaths },
						currentIndex: { $apply: (val) => val + 1 },
					},
					// clearing other selected files and folders
					selectedFiles: { $set: [] },
					selectedFolders: { $set: [] },
				},
			})
		);
	};

	const renderDate = (record, dateField) => {
		const date = record.meta?.[dateField];
		if (!date) return '';
		return new Date(date).toGMTString();
	};

	const renderType = (record) => {
		if (record.__typename == 'Folder') {
			return 'File folder';
		} else {
			const ext = (record.name ?? '').split('.').pop();
			let fullName = fileExtensionsMap?.[ext]?.fullName;
			return fullName ? fullName : ext.toUpperCase() + ' file';
		}
	};

	const renderName = (record) => {
		const { name = '', __typename } = record;
		if (__typename == 'Folder') {
			return name;
		}
		const nameSplit = name.split('.');
		// !localStorage.showFileExtensions && localStorage.showHiddenItems, this is because a hidden item starts with a dot(.), so the rest of the name should not be considered a extension
		if (
			localStorage.showFileExtensions ||
			(!localStorage.showFileExtensions &&
				localStorage.showHiddenItems &&
				!nameSplit[0])
		) {
			return name;
		} else {
			return nameSplit.slice(0, nameSplit.length - 1).join('.');
		}
	};

	const renderSize = (record) => {
		if (record.__typename == 'Folder') {
			return '';
		} else {
			return formatBytes(record.size);
		}
	};

	const recordIsSelected = (record) => {
		const { __typename, id } = record;
		if (!__typename) {
			return false;
		} else {
			return tabsState[activeTabId][`selected${__typename}s`].includes(id);
		}
	};

	const props = {
		record,
		handleSelectFileFolderOnClick,
		updateCurrentFolderId,
		renderDate,
		renderType,
		renderName,
		renderSize,
		recordIsSelected,
	};

	return (
		<>
			{localStorage.layout == 'details' && <DetailsLayout {...props} />}
			{localStorage.layout == 'tiles' && <TilesLayout {...props} />}
			{localStorage.layout.includes('Icons') && <IconsLayout {...props} />}
		</>
	);
};

export default Layout;
