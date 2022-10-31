import { useContext } from 'react';
import { MenuRadioGroup, MenuDivider, MenuHeader } from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { setLocalStorageFolderSpecific } from '../../utils/utils';
import { FileManagerContext } from '../../FileManager';
import FileMenuItemGroup from './FileMenuItemGroup';

const SortDropdown = () => {
	const { tabsState, activeTabId, localStorage, setLocalStorage } =
		useContext(FileManagerContext);

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
			<MenuHeader>Sort By</MenuHeader>
			<MenuRadioGroup value={sortBy} onRadioChange={(e) => setSortBy(e.value)}>
				<FileMenuItemGroup />
			</MenuRadioGroup>

			<MenuDivider />
			<MenuHeader>Sort Order</MenuHeader>
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
