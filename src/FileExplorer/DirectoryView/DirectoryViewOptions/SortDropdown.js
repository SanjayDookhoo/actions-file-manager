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
				<a title="Layout">
					<span className={buttonStyle}>swap_vert</span>
				</a>
			}
		>
			<FileSubMenu controlledStatePadding={true} description="Sort By">
				<MenuRadioGroup
					value={sortBy}
					onRadioChange={(e) => setSortBy(e.value)}
				>
					<FileMenuItemGroup />
				</MenuRadioGroup>

				<MenuDivider />

				<MenuRadioGroup
					value={sortOrder}
					onRadioChange={(e) => setSortOrder(e.value)}
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
			</FileSubMenu>
			<FileSubMenu controlledStatePadding={true} description="Group By">
				<MenuRadioGroup
					value={groupBy}
					onRadioChange={(e) => setGroupBy(e.value)}
				>
					<FileMenuItem description="None" type="radio" value="none" />
					<FileMenuItemGroup />
				</MenuRadioGroup>

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
			</FileSubMenu>
		</Menu>
	);
};

export default SortDropdown;

const FileMenuItemGroup = () => {
	return (
		<>
			<FileMenuItem description="Name" type="radio" value="name" />
			<FileMenuItem
				description="Date Modified"
				type="radio"
				value="dateModified"
			/>
			<FileMenuItem
				description="Date Created"
				type="radio"
				value="dateCreated"
			/>
			<FileMenuItem description="Size" type="radio" value="size" />
			<FileMenuItem description="Type" type="radio" value="type" />
		</>
	);
};
