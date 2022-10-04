import {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { dateVariations, update } from '../../../utils/utils';
import { FileExplorerContext } from '../../../FileExplorer';
import Item from './ItemContainer/Item';
import { buttonStyle } from '../../../utils/constants';

const Group = ({
	groupIndex,
	groupName,
	items,
	files,
	folders,
	setFlexContainerWidth,
	...otherProps
}) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		fileExtensionsMap,
	} = useContext(FileExplorerContext);
	const { path } = tabsState[activeTabId];
	const {
		sortOrder = 1,
		sortBy = 'name',
		groupOrder = 1,
		groupBy = 'none',
	} = localStorage.folderSpecific?.[path] ?? {};
	const [collapsed, setCollapsed] = useState(false);
	const [itemsSorted, setItemsSorted] = useState([]);

	const flexContainerRef = useRef();

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
				return compare * sortOrder;
			} else if (dateVariations.includes(sortBy)) {
				const a = recordA.meta[sortBy];
				const b = recordB.meta[sortBy];
				const compare = new Date(a) - new Date(b);
				return compare * sortOrder;
			} else if (sortBy == 'size') {
				const a = recordA[sortBy];
				const b = recordB[sortBy];
				const compare = a - b;
				return compare * sortOrder;
			} else if (sortBy == 'type') {
				const aExt = recordA.name.split('.').pop();
				const bExt = recordB.name.split('.').pop();
				let a =
					_a.__typename == 'folder'
						? 'File folder'
						: fileExtensionsMap?.[aExt]?.fullName;
				let b =
					_b.__typename == 'folder'
						? 'File folder'
						: fileExtensionsMap?.[bExt]?.fullName;
				a = a ? a : aExt.toUpperCase() + ' File';
				b = b ? b : bExt.toUpperCase() + ' File';
				const compare = a.localeCompare(b);
				return compare * sortOrder;
			}
		};

		const tempItemsSorted = [...items].sort(handleSort);
		setItemsSorted(tempItemsSorted);
	}, [items, sortBy, sortOrder, fileExtensionsMap]);

	const handleCollapsibleClick = (e) => {
		e.stopPropagation();
		setCollapsed(!collapsed);
	};

	const handleGroupSelectAll = (e) => {
		e.stopPropagation();
		const selectedFiles = itemsSorted
			.filter((item) => item.__typename == 'file')
			.map((item) => item.id);
		const selectedFolders = itemsSorted
			.filter((item) => item.__typename == 'folder')
			.map((item) => item.id);

		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: selectedFiles },
					selectedFolders: { $set: selectedFolders },
				},
			})
		);
	};

	const getRecord = (item) => {
		const { id, __typename } = item;
		let record;
		if (__typename == 'folder')
			record = folders.find((folder) => folder.id == id);
		else record = files.find((file) => file.id == id);
		return record;
	};

	useLayoutEffect(() => {
		if (groupIndex == 0) {
			const flexContainer = flexContainerRef.current;
			const handleResizeObserver = () => {
				const width = flexContainer.offsetWidth;
				setFlexContainerWidth(width);
			};
			const observer = new ResizeObserver(handleResizeObserver);
			observer.observe(flexContainer);
			return () => {
				observer.unobserve(flexContainer);
			};
		}
	}, [groupIndex]);

	const itemProps = {
		getRecord,
		...otherProps,
	};

	return (
		<>
			{groupName != 'noneGrouping' && (
				<div className="flex items-center test" onClick={handleGroupSelectAll}>
					<div onClick={handleCollapsibleClick}>
						<span className={buttonStyle}>
							{collapsed ? 'expand_more' : 'expand_less'}
						</span>
					</div>
					<div>
						{groupName} ({items.length})
					</div>
					<div className="mx-3 group-separator"></div>
				</div>
			)}
			{!collapsed && (
				<div
					className={
						'flex ' +
						(localStorage.layout == 'details' ? 'flex-col w-fit' : 'flex-wrap')
					}
					ref={flexContainerRef}
				>
					{itemsSorted.map((item, index) => (
						<Item
							key={`${item.__typename}-${item.id}`}
							item={item}
							itemIndex={index}
							groupIndex={groupIndex}
							{...itemProps}
						/>
					))}
				</div>
			)}
		</>
	);
};

export default Group;
