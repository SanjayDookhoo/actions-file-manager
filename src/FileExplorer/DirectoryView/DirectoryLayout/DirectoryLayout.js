import { useContext, useEffect, useState } from 'react';
import {
	ControlledMenu,
	FocusableItem,
	MenuDivider,
	MenuItem,
	useMenuState,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { buttonStyle } from '../../utils/constants';
import FileFocusableItem from '../../CustomReactMenu/FileFocusableItem';
import FileUploadDiv from '../../FileUploadDiv/FileUploadDiv';
import {
	canEdit,
	createBuckets,
	dateVariations,
	formatBytes,
	getFolderId,
	rootNavigationMap,
	update,
} from '../../utils/utils';
import { FileExplorerContext } from '../../FileExplorer';
import defaultFile from '../../assets/defaultFile.webp';
import folder from '../../assets/folder.svg';
import Group from './Group/Group';
import FileSubMenu from '../../CustomReactMenu/FileSubMenu';
import GroupDropdown from '../DirectoryViewOptions/GroupDropdown';
import SortDropdown from '../DirectoryViewOptions/SortDropdown';
import LayoutDropdown from '../DirectoryViewOptions/LayoutDropdown';
import NewDropdown from '../DirectoryViewOptions/NewDropdown';

const DirectoryLayout = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		files,
		folders,
		fileExtensionsMap,
		setFolderArguments,
		setFileArguments,
		filtered,
		setFiltered,
		paste,
		handlePaste,
		rootUserFolderId,
	} = useContext(FileExplorerContext);
	const [menuPropsHeader, toggleMenuHeader] = useMenuState();
	const [anchorPointHeader, setAnchorPointHeader] = useState({ x: 0, y: 0 });
	const [menuPropsEmpty, toggleMenuHeaderEmpty] = useMenuState();
	const [anchorPointEmpty, setAnchorPointEmpty] = useState({ x: 0, y: 0 });

	/**
	 * [
	 * 		{
	 * 			id:
	 * 			type: 'folder' || 'file'
	 * 		}
	 * ]
	 */
	const [filteredGrouped, setFilteredGrouped] = useState({});
	const [groupBuckets, setGroupBuckets] = useState({});

	const { path } = tabsState[activeTabId];
	const {
		sortOrder = 'ascending',
		sortBy = 'name',
		groupOrder = 'ascending',
		groupBy = 'none',
	} = localStorage.folderSpecific?.[path] ?? {};
	const { detailsLayoutMeta, layout } = localStorage;

	useEffect(() => {
		if (groupBy != 'none' && groupBuckets[groupBy]) {
			let orderedKeys = Object.keys(groupBuckets[groupBy]);
			if (sortOrder == 'descending') orderedKeys = [...orderedKeys].reverse();
			const tempFilteredGroup = {};

			orderedKeys.forEach((key) => {
				tempFilteredGroup[key] = groupBuckets[groupBy][key];
			});
			setFilteredGrouped(tempFilteredGroup);
		} else {
			setFilteredGrouped({
				noneGrouping: filtered,
			});
		}
	}, [groupBy, groupOrder, groupBuckets, filtered]);

	useEffect(() => {
		const bucket = createBuckets({
			records: filtered,
			files,
			folders,
			fileExtensionsMap,
		});
		setGroupBuckets(bucket);
	}, [filtered, files, folders, fileExtensionsMap]);

	const handleOnContextMenuHeader = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setAnchorPointHeader({ x: e.clientX, y: e.clientY });
		toggleMenuHeader(true);
	};

	const handleOnContextMenuEmpty = (e) => {
		e.preventDefault();
		setAnchorPointEmpty({ x: e.clientX, y: e.clientY });
		toggleMenuHeaderEmpty(true);

		// deselect all selected
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: [] },
					selectedFolders: { $set: [] },
				},
			})
		);
	};

	const handleEmptySpaceOnClick = () => {
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: [] },
					selectedFolders: { $set: [] },
				},
			})
		);
	};

	const setDetailsLayoutMeta = (e, key) => {
		const { checked } = e;
		setLocalStorage(
			update(localStorage, {
				detailsLayoutMeta: { [key]: { visible: { $set: checked } } },
			})
		);
	};

	const groupProps = {
		files,
		folders,
		fileExtensionsMap,
	};

	return (
		<div
			className="w-full"
			onClick={handleEmptySpaceOnClick}
			onContextMenu={handleOnContextMenuEmpty}
		>
			<FileUploadDiv
				folderId={getFolderId({ tabsState, activeTabId, rootUserFolderId })}
				style={{ width: '100%', height: '100%' }}
			>
				<div>
					{layout == 'details' && (
						<div className="flex">
							{Object.entries(detailsLayoutMeta)
								.filter(([key, meta]) => meta.visible)
								.sort((_a, _b) => {
									const a = _a[1].order;
									const b = _b[1].order;
									return a - b;
								})
								.map(([key, meta]) => (
									<div
										key={key}
										style={{ width: meta.width }}
										onContextMenu={handleOnContextMenuHeader}
									>
										{key}
									</div>
								))}

							<ControlledMenu
								{...menuPropsHeader}
								anchorPoint={anchorPointHeader}
								onClose={() => toggleMenuHeader(false)}
							>
								<div className="w-64">
									<FileMenuItem
										controlledStatePadding={true}
										description="Size all columns to fit"
									/>
									<MenuDivider />
									{Object.entries(localStorage.detailsLayoutMeta).map(
										([key, meta]) => (
											<FileMenuItem
												key={key}
												type="checkbox"
												checked={meta.visible}
												onClick={(e) => setDetailsLayoutMeta(e, key)}
												description={key}
											/>
										)
									)}
								</div>
							</ControlledMenu>
						</div>
					)}

					{Object.entries(filteredGrouped).map(([groupName, items], i) => (
						<Group
							key={i}
							groupName={groupName}
							items={items}
							{...groupProps}
						/>
					))}
				</div>

				<ControlledMenu
					{...menuPropsEmpty}
					anchorPoint={anchorPointEmpty}
					onClose={() => toggleMenuHeaderEmpty(false)}
				>
					<div className="w-64">
						{paste && (
							<>
								<FileFocusableItem
									title="paste"
									icon="content_paste"
									onClick={handlePaste}
								/>
								<MenuDivider />
							</>
						)}
						<FileSubMenu logo="grid_view" description="Layout">
							<LayoutDropdown />
						</FileSubMenu>
						<FileSubMenu logo="swap_vert" description="Sort by">
							<SortDropdown />
						</FileSubMenu>
						<FileSubMenu logo="dvr" description="Group by">
							<GroupDropdown />
						</FileSubMenu>
						<MenuDivider />
						{canEdit({ tabsState, activeTabId }) && (
							<FileSubMenu logo="add" description="New">
								<NewDropdown />
							</FileSubMenu>
						)}
					</div>
				</ControlledMenu>
			</FileUploadDiv>
		</div>
	);
};

export default DirectoryLayout;
