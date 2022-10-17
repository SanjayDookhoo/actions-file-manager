import { useContext, useEffect, useState } from 'react';
import FilesOptions from '../../FilesOptions/FilesOptions';
import { buttonStyle } from '../../utils/constants';
import {
	Menu,
	MenuItem,
	FocusableItem,
	SubMenu,
	MenuRadioGroup,
	MenuDivider,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import FileSubMenu from '../../CustomReactMenu/FileSubMenu';
import { FileManagerContext } from '../../FileManager';
import { update } from '../../utils/utils';

const SelectionDropdown = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		localStorage,
		setLocalStorage,
		folders,
		files,
		breakpointClass,
	} = useContext(FileManagerContext);

	const selectAll = () => {
		const selectedFolders = folders.map((folder) => folder.id);
		const selectedFiles = files.map((file) => file.id);

		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: selectedFiles },
					selectedFolders: { $set: selectedFolders },
				},
			})
		);
	};

	const invertSelection = () => {
		const prevSelectedFolders = tabsState[activeTabId].selectedFolders;
		const prevSelectedFiles = tabsState[activeTabId].selectedFiles;
		const selectedFolders = folders
			.filter((folder) => !prevSelectedFolders.includes(folder.id))
			.map((folder) => folder.id);
		const selectedFiles = files
			.filter((file) => !prevSelectedFiles.includes(file.id))
			.map((file) => file.id);

		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: selectedFiles },
					selectedFolders: { $set: selectedFolders },
				},
			})
		);
	};

	const clearSelection = () => {
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
		<Menu
			menuButton={
				<a className="hover flex items-center" title="Selection options">
					<span className={buttonStyle}>check_box</span>
					<span
						className={
							'material-symbols-outlined text-sm relative -left-1 ' +
							breakpointClass({
								lg: 'block',
								default: 'hidden',
							})
						}
					>
						expand_more
					</span>
				</a>
			}
		>
			<FileMenuItem
				description="Multiselect"
				type="checkbox"
				checked={localStorage.multiselect}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, multiselect: e.checked })
				}
			/>
			<MenuDivider />
			<FileMenuItem
				controlledStatePadding={true}
				logo="folder"
				description="Select All"
				onClick={selectAll}
			/>
			<FileMenuItem
				controlledStatePadding={true}
				logo="folder"
				description="Invert Selection"
				onClick={invertSelection}
			/>
			<FileMenuItem
				controlledStatePadding={true}
				logo="folder"
				description="Clear Selection"
				onClick={clearSelection}
			/>
		</Menu>
	);
};

export default SelectionDropdown;
