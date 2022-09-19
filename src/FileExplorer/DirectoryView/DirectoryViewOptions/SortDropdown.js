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
import { update } from '../../utils/utils';
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
	const {
		sortOrder = 'ascending',
		sortBy = 'name',
		groupOrder = 'ascending',
		groupBy = 'none',
	} = localStorage.folderSpecific?.[path] ?? {};

	const setLocalStorageFolderSpecific = (obj) => {
		setLocalStorage(
			update(localStorage, {
				folderSpecific: {
					$merge: {
						[path]: obj,
					},
				},
			})
		);
	};

	const setSortOrder = (val) => {
		const sortOrder = val;
		setLocalStorageFolderSpecific({
			sortOrder,
			sortBy,
			groupOrder,
			groupBy,
		});
	};

	const setSortBy = (val) => {
		const sortBy = val;
		setLocalStorageFolderSpecific({
			sortOrder,
			sortBy,
			groupOrder,
			groupBy,
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
				<FileMenuItem description="Ascending" type="radio" value="ascending" />
				<FileMenuItem
					description="Descending"
					type="radio"
					value="descending"
				/>
			</MenuRadioGroup>
		</>
	);
};

export default SortDropdown;
