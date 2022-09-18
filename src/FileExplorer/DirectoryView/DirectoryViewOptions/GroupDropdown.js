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

const GroupDropdown = () => {
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

	const setGroupOrder = (val) => {
		const groupOrder = val;
		setLocalStorageFolderSpecific({
			sortOrder,
			sortBy,
			groupOrder,
			groupBy,
		});
	};

	const setGroupBy = (val) => {
		const groupBy = val;
		setLocalStorageFolderSpecific({
			sortOrder,
			sortBy,
			groupOrder,
			groupBy,
		});
	};

	return (
		<Menu
			menuButton={
				<a title="Group">
					<span className={buttonStyle}>dvr</span>
				</a>
			}
		>
			<MenuRadioGroup
				value={groupBy}
				onRadioChange={(e) => setGroupBy(e.value)}
			>
				<FileMenuItem description="(None)" type="radio" value="none" />
				<FileMenuItemGroup />
			</MenuRadioGroup>

			{groupBy != 'none' && (
				<>
					<MenuDivider />

					<MenuRadioGroup
						value={groupOrder}
						onRadioChange={(e) => setGroupOrder(e.value)}
					>
						<FileMenuItem
							description="Ascending"
							type="radio"
							value="ascending"
						/>
						<FileMenuItem
							description="Descending"
							type="radio"
							value="descending"
						/>
					</MenuRadioGroup>
				</>
			)}
		</Menu>
	);
};

export default GroupDropdown;
