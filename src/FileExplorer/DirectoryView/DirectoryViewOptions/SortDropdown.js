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
import { setLocalStorageFolderSpecific, update } from '../../utils/utils';
import { FileExplorerContext } from '../../FileExplorer';
import FileMenuItemGroup from './FileMenuItemGroup';

const SortDropdown = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
	} = useContext(FileExplorerContext);

	const { path } = tabsState[activeTabId];
	const folderSpecific = localStorage.folderSpecific?.[path] ?? {};
	const { sortOrder = 1, sortBy = 'name' } = folderSpecific;

	const params = {
		prev: folderSpecific,
		localStorage,
		setLocalStorage,
		path,
	};

	const setSortOrder = (val) => {
		const curr = {
			sortOrder: val,
		};
		setLocalStorageFolderSpecific({
			curr,
			...params,
		});
	};

	const setSortBy = (val) => {
		const curr = {
			sortBy: val,
		};
		setLocalStorageFolderSpecific({
			curr,
			...params,
		});
	};

	return (
		<>
			<MenuRadioGroup value={sortBy} onRadioChange={(e) => setSortBy(e.value)}>
				<FileMenuItemGroup />
			</MenuRadioGroup>

			<MenuDivider />

			<MenuRadioGroup
				value={sortOrder}
				onRadioChange={(e) => setSortOrder(e.value)}
			>
				<FileMenuItem description="Ascending" type="radio" value={1} />
				<FileMenuItem description="Descending" type="radio" value={-1} />
			</MenuRadioGroup>
		</>
	);
};

export default SortDropdown;
