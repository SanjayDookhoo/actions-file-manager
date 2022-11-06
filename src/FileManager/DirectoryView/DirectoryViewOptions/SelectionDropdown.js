import { useContext } from 'react';
import { buttonStyle } from '../../utils/constants';
import { Menu, MenuDivider } from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { FileManagerContext } from '../../FileManager';
import {
	shortcutHintGenerate,
	shortcutHotkeyGenerate,
	update,
} from '../../utils/utils';
import { useHotkeys } from 'react-hotkeys-hook';

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

	useHotkeys(
		shortcutHotkeyGenerate('ctrl+a'),
		(e) => {
			e.preventDefault();
			selectAll();
		},
		[folders, files, tabsState, activeTabId]
	);

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
				shortcutHint={shortcutHintGenerate(`Ctrl+A`)}
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
