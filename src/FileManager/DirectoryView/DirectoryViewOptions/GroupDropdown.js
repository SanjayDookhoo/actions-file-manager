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
	MenuHeader,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import FileSubMenu from '../../CustomReactMenu/FileSubMenu';
import { setLocalStorageFolderSpecific, update } from '../../utils/utils';
import { FileManagerContext } from '../../FileManager';
import FileMenuItemGroup from './FileMenuItemGroup';

const GroupDropdown = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
	} = useContext(FileManagerContext);

	const { path } = tabsState[activeTabId];
	const folderSpecific = localStorage.folderSpecific?.[path] ?? {};
	const { groupOrder = 1, groupBy = 'none' } = folderSpecific;

	const params = {
		prev: folderSpecific,
		localStorage,
		setLocalStorage,
		path,
	};

	const setGroupOrder = (val) => {
		const curr = {
			groupOrder: val,
		};
		setLocalStorageFolderSpecific({
			curr,
			...params,
		});
	};

	const setGroupBy = (val) => {
		const curr = {
			groupBy: val,
		};
		setLocalStorageFolderSpecific({
			curr,
			...params,
		});
	};

	return (
		<>
			<MenuHeader>Group By</MenuHeader>
			<MenuRadioGroup
				value={groupBy}
				onRadioChange={(e) => setGroupBy(e.value)}
			>
				<FileMenuItem description="(None)" type="radio" value="none" />
				<FileMenuItemGroup />
			</MenuRadioGroup>

			{groupBy !== 'none' && (
				<>
					<MenuDivider />
					<MenuHeader>Group Order</MenuHeader>
					<MenuRadioGroup
						value={groupOrder}
						onRadioChange={(e) => setGroupOrder(e.value)}
					>
						<FileMenuItem description="Ascending" type="radio" value={1} />
						<FileMenuItem description="Descending" type="radio" value={-1} />
					</MenuRadioGroup>
				</>
			)}
		</>
	);
};

export default GroupDropdown;
