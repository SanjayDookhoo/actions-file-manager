import { useContext, useEffect, useState } from 'react';
import { dateVariations } from '../../../utils/utils';
import { FileExplorerContext } from '../../../FileExplorer';
import Item from './ItemContainer/Item';

const Group = ({
	groupName,
	items,
	files,
	folders,
	fileExtensionsMap,
	...otherProps
}) => {
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
	const [collapsed, setCollapsed] = useState(false);
	const [itemsSorted, setItemsSorted] = useState([]);

	useEffect(() => {
		const handleSort = (_a, _b) => {
			if (!fileExtensionsMap) {
				return true;
			}
			const recordA = getRecord(_a);
			const recordB = getRecord(_b);

			if (!recordA || !recordB) {
				return 1;
			}

			if (sortBy == 'name') {
				const a = recordA[sortBy];
				const b = recordB[sortBy];
				const compare = a.localeCompare(b);
				return compare * (sortOrder == 'ascending' ? 1 : -1);
			} else if (dateVariations.includes(sortBy)) {
				const a = recordA.meta[sortBy];
				const b = recordB.meta[sortBy];
				const compare = new Date(a) - new Date(b);
				return compare * (sortOrder == 'ascending' ? 1 : -1);
			} else if (sortBy == 'size') {
				const a = recordA[sortBy];
				const b = recordB[sortBy];
				const compare = a - b;
				return compare * (sortOrder == 'ascending' ? 1 : -1);
			} else if (sortBy == 'type') {
				const aExt = recordA.name.split('.').pop();
				const bExt = recordB.name.split('.').pop();
				let a =
					_a.type == 'folder'
						? 'File folder'
						: fileExtensionsMap?.[aExt]?.fullName;
				let b =
					_b.type == 'folder'
						? 'File folder'
						: fileExtensionsMap?.[bExt]?.fullName;
				a = a ? a : aExt.toUpperCase() + ' File';
				b = b ? b : bExt.toUpperCase() + ' File';
				const compare = a.localeCompare(b);
				return compare * (sortOrder == 'ascending' ? 1 : -1);
			}
		};

		const tempItemsSorted = [...items].sort(handleSort);
		setItemsSorted(tempItemsSorted);
	}, [items, sortBy, sortOrder, fileExtensionsMap]);

	const handleOnClick = (e) => {
		e.stopPropagation();
		setCollapsed(!collapsed);
	};

	const getRecord = (item) => {
		const { id, type } = item;
		let record;
		if (type == 'folder') record = folders.find((folder) => folder.id == id);
		else if (type == 'file') record = files.find((file) => file.id == id);
		return record;
	};

	const itemProps = {
		getRecord,
		fileExtensionsMap,
		...otherProps,
	};

	return (
		<>
			{groupName != 'noneGrouping' && (
				<div onClick={handleOnClick}>
					{groupName} ({items.length})
				</div>
			)}
			{!collapsed && (
				<div
					className={
						'flex w-full h-full ' +
						(localStorage.layout == 'details' ? 'flex-col' : 'flex-wrap')
					}
				>
					{itemsSorted.map((item) => (
						<Item key={`${item.type}-${item.id}`} item={item} {...itemProps} />
					))}
				</div>
			)}
		</>
	);
};

export default Group;
