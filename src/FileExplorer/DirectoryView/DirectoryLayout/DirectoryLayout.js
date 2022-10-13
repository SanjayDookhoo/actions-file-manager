import { useContext, useEffect, useState } from 'react';
import {
	ControlledMenu,
	FocusableItem,
	MenuDivider,
	MenuItem,
	useMenuState,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { buttonStyle, imageTypes } from '../../utils/constants';
import FileFocusableItem from '../../CustomReactMenu/FileFocusableItem';
import FileUploadDiv from '../../FileUploadDiv/FileUploadDiv';
import {
	camelCaseToPhrase,
	canEdit,
	createBuckets,
	dateVariations,
	formatBytes,
	getFolderId,
	setLocalStorageFolderSpecific,
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
import FilesOptions from '../../FilesOptions/FilesOptions';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
		sharedAccessType,
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
	const [filteredGroupedSorted, setFilteredGroupedSorted] = useState({});
	const [groupBuckets, setGroupBuckets] = useState({});

	const { path } = tabsState[activeTabId];
	const folderSpecific = localStorage.folderSpecific?.[path] ?? {};
	const {
		sortOrder = 1,
		sortBy = 'name',
		groupOrder = 1,
		groupBy = 'none',
	} = folderSpecific;
	const { detailsLayoutMeta, layout } = localStorage;

	const [mouseX, setMouseX] = useState();
	const [dragging, setDragging] = useState(false);

	const [flexContainerWidth, setFlexContainerWidth] = useState(0);
	const [itemWidth, setItemWidth] = useState(0);
	const [itemsPerRow, setItemsPerRow] = useState(0);
	const [newGroupItemFocus, setNewGroupItemFocus] = useState(null);
	const [imageGalleryOrdered, setImageGalleryOrdered] = useState([]);

	useEffect(() => {
		let images = [];
		Object.values(filteredGroupedSorted).forEach((groups) => {
			const imagesTemp = groups.filter((item) => {
				const { id, __typename } = item;
				if (__typename == 'folder') return false;
				const record = files.find((file) => file.id == id);
				if (record) {
					const ext = (record.name ?? '').split('.').pop();
					if (imageTypes.includes(ext)) return true;
				}
				return false;
			});
			images = [...images, ...imagesTemp];
		});
		setImageGalleryOrdered(images);
	}, [files, filteredGroupedSorted]);

	const getRecord = (item) => {
		const { id, __typename } = item;
		let record;
		if (__typename == 'folder')
			record = folders.find((folder) => folder.id == id);
		else record = files.find((file) => file.id == id);
		return record;
	};

	useEffect(() => {
		const tempFilteredGroupedSorted = {};

		Object.entries(filteredGrouped).forEach(([key, groups]) => {
			tempFilteredGroupedSorted[key] = sortGroups(groups);
		});
		setFilteredGroupedSorted(tempFilteredGroupedSorted);
	}, [filteredGrouped, sortOrder, sortBy]);

	const sortGroups = (groups) => {
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

		return [...groups].sort(handleSort);
	};

	useEffect(() => {
		if (dragging) {
			const { x, key, originalWidth } = dragging;
			const dx = mouseX - x;
			const width = originalWidth + dx + 'px';

			setLocalStorage(
				update(localStorage, {
					detailsLayoutMeta: { [key]: { width: { $set: width } } },
				})
			);
		}
	}, [mouseX, dragging]);

	const handleMouseDown = (e, key) => {
		setDragging({
			key,
			x: e.clientX,
			originalWidth: parseInt(detailsLayoutMeta[key].width),
		});
	};

	useEffect(() => {
		const handleSetMouseX = (e) => {
			setMouseX(e.x);
		};
		document.addEventListener('mousemove', handleSetMouseX, false);
		return () => {
			document.removeEventListener('mousemove', handleSetMouseX, false);
		};
	}, []);

	useEffect(() => {
		const handleSetDragging = (e) => {
			setDragging(false);
		};
		document.addEventListener('mouseup', handleSetDragging, false);
		return () => {
			document.removeEventListener('mouseup', handleSetDragging, false);
		};
	}, []);

	useEffect(() => {
		if (groupBy != 'none' && groupBuckets[groupBy]) {
			let orderedKeys = Object.keys(groupBuckets[groupBy]);
			if (groupOrder == -1) orderedKeys = [...orderedKeys].reverse();
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

	const handleMenuHeaderClick = (key) => {
		console.log({ key });
		const params = {
			prev: folderSpecific,
			localStorage,
			setLocalStorage,
			path,
		};

		const curr = {
			sortBy: key,
		};
		setLocalStorageFolderSpecific({
			curr,
			...params,
		});
	};

	const handleOnDragEnd = (result) => {
		if (!result.destination) {
			return;
		}

		const keys = Object.entries(detailsLayoutMeta)
			.filter(([key, meta]) => meta.visible)
			.sort((_a, _b) => {
				const a = _a[1].order;
				const b = _b[1].order;
				return a - b;
			})
			.map(([key, meta]) => key);
		const tempDetailsLayoutMeta = { ...detailsLayoutMeta };
		const destIndex = result.destination.index;
		const srcIndex = result.source.index;

		if (destIndex > srcIndex) {
			for (let i = srcIndex + 1; i <= destIndex; i++) {
				tempDetailsLayoutMeta[keys[i]].order--;
			}
			tempDetailsLayoutMeta[keys[srcIndex]].order =
				tempDetailsLayoutMeta[keys[destIndex]].order + 1;
		} else if (destIndex < srcIndex) {
			for (let i = destIndex; i < srcIndex; i++) {
				tempDetailsLayoutMeta[keys[i]].order++;
			}
			tempDetailsLayoutMeta[keys[srcIndex]].order =
				tempDetailsLayoutMeta[keys[destIndex]].order - 1;
		}

		setLocalStorage(
			update(localStorage, {
				detailsLayoutMeta: {
					$set: tempDetailsLayoutMeta,
				},
			})
		);
	};

	const handleOnKeyDown = ({ e, groupIndex, itemIndex }) => {
		let obj;
		const { keyCode } = e;

		const itemGroups = Object.values(filteredGroupedSorted);

		if (localStorage.layout == 'details') {
			if (keyCode == 38) {
				// up
				const newItemIndex = itemIndex - 1;
				if (newItemIndex >= 0) {
					obj = {
						groupIndex,
						itemIndex: newItemIndex,
					};
				} else if (groupIndex - 1 >= 0) {
					const newGroupIndex = groupIndex - 1;
					obj = {
						groupIndex: newGroupIndex,
						itemIndex: itemGroups[newGroupIndex].length - 1,
					};
				}
			} else if (keyCode == 40) {
				// down
				const newItemIndex = itemIndex + 1;
				if (newItemIndex < itemGroups[groupIndex].length) {
					obj = {
						groupIndex,
						itemIndex: newItemIndex,
					};
				} else if (groupIndex + 1 < itemGroups.length) {
					const newGroupIndex = groupIndex + 1;
					obj = {
						groupIndex: newGroupIndex,
						itemIndex: 0,
					};
				}
			}
		} else {
			if (keyCode == 37) {
				// left
				const newItemIndex = itemIndex - 1;
				if (newItemIndex >= 0) {
					obj = {
						groupIndex,
						itemIndex: newItemIndex,
					};
				} else if (groupIndex - 1 >= 0) {
					const newGroupIndex = groupIndex - 1;
					obj = {
						groupIndex: newGroupIndex,
						itemIndex: itemGroups[newGroupIndex].length - 1,
					};
				}
			} else if (keyCode == 38) {
				// up
				const newItemIndex = itemIndex - itemsPerRow;
				if (newItemIndex >= 0) {
					obj = {
						groupIndex,
						itemIndex: newItemIndex,
					};
				} else if (groupIndex - 1 >= 0) {
					const newGroupIndex = groupIndex - 1;
					obj = {
						groupIndex: newGroupIndex,
						itemIndex: itemGroups[newGroupIndex].length - 1,
					};
				}
			} else if (keyCode == 39) {
				// right
				const newItemIndex = itemIndex + 1;
				if (newItemIndex < itemGroups[groupIndex].length) {
					obj = {
						groupIndex,
						itemIndex: newItemIndex,
					};
				} else if (groupIndex + 1 < itemGroups.length) {
					const newGroupIndex = groupIndex + 1;
					obj = {
						groupIndex: newGroupIndex,
						itemIndex: 0,
					};
				}
			} else if (keyCode == 40) {
				// down
				const newItemIndex = itemIndex + itemsPerRow;
				if (newItemIndex < itemGroups[groupIndex].length) {
					obj = {
						groupIndex,
						itemIndex: newItemIndex,
					};
				} else if (groupIndex + 1 < itemGroups.length) {
					const newGroupIndex = groupIndex + 1;
					obj = {
						groupIndex: newGroupIndex,
						itemIndex: 0,
					};
				}
			}
		}

		setNewGroupItemFocus({
			...obj,
			event: 'keyboard',
		});
	};

	useEffect(() => {
		setItemsPerRow(Math.floor(flexContainerWidth / itemWidth));
	}, [itemWidth, flexContainerWidth]);

	const groupProps = {
		files,
		folders,
		fileExtensionsMap,
		handleOnKeyDown,
		setFlexContainerWidth,
		setItemWidth,
		newGroupItemFocus,
		setNewGroupItemFocus,
		imageGalleryOrdered,
		getRecord,
	};

	return (
		<div
			className="w-full"
			onClick={handleEmptySpaceOnClick}
			onContextMenu={handleOnContextMenuEmpty}
		>
			<FileUploadDiv
				folderId={getFolderId({ tabsState, activeTabId, rootUserFolderId })}
				style={{ width: '100%', minHeight: '100%' }}
			>
				<div>
					{layout == 'details' && (
						<div className="sticky top-0 bg-shade-2">
							<DragDropContext onDragEnd={handleOnDragEnd}>
								<Droppable droppableId="droppable" direction="horizontal">
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.droppableProps}
											className="flex p-1"
										>
											<div className="pl-6">&nbsp;</div>
											{/*pl compensates for the logo */}
											{Object.entries(detailsLayoutMeta)
												.filter(([key, meta]) => meta.visible)
												.sort((_a, _b) => {
													const a = _a[1].order;
													const b = _b[1].order;
													return a - b;
												})
												.map(([key, meta], index) => (
													<Draggable key={key} draggableId={key} index={index}>
														{(provided, snapshot) => (
															<div
																ref={provided.innerRef}
																{...provided.draggableProps}
																className="flex items-center"
															>
																{/* dragHandleProps designates the draggable area https://stackoverflow.com/a/61360662/4224964 */}
																<div {...provided.dragHandleProps}>
																	<div
																		className="flex justify-between items-center text-ellipsis overflow-hidden whitespace-nowrap px-2 hover h-9"
																		style={{
																			width: meta.width,
																		}}
																		onClick={() => handleMenuHeaderClick(key)}
																		onContextMenu={handleOnContextMenuHeader}
																	>
																		{camelCaseToPhrase(key)}
																		{sortBy == key && sortOrder == 1 && (
																			<span className={buttonStyle}>
																				expand_less
																			</span>
																		)}
																		{sortBy == key && sortOrder == -1 && (
																			<span className={buttonStyle}>
																				expand_more
																			</span>
																		)}
																	</div>
																</div>
																<div
																	className="border-2 border-transparent hover:border-white select-none cursor-col-resize"
																	onMouseDown={(e) => handleMouseDown(e, key)}
																>
																	<div className="drag h-full w-0.5 bg-white ">
																		&nbsp;
																	</div>
																</div>
															</div>
														)}
													</Draggable>
												))}

											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>

							<ControlledMenu
								{...menuPropsHeader}
								anchorPoint={anchorPointHeader}
								onClose={() => toggleMenuHeader(false)}
							>
								<div className="w-64">
									{/* <FileMenuItem
										controlledStatePadding={true}
										description="Size all columns to fit"
									/>
									<MenuDivider /> */}
									{Object.entries(localStorage.detailsLayoutMeta).map(
										([key, meta]) => (
											<FileMenuItem
												key={key}
												type="checkbox"
												checked={meta.visible}
												onClick={(e) => setDetailsLayoutMeta(e, key)}
												description={camelCaseToPhrase(key)}
												disabled={key == 'name' ? true : false}
											/>
										)
									)}
								</div>
							</ControlledMenu>
						</div>
					)}

					{Object.entries(filteredGroupedSorted).map(
						([groupName, items], i) => (
							<Group
								key={i}
								groupIndex={i}
								groupName={groupName}
								items={items}
								{...groupProps}
							/>
						)
					)}
				</div>

				<ControlledMenu
					{...menuPropsEmpty}
					anchorPoint={anchorPointEmpty}
					onClose={() => toggleMenuHeaderEmpty(false)}
				>
					<div className="w-64">
						<FilesOptions item={true} buttonsToFilter={['paste']} />
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
						{canEdit({ tabsState, activeTabId, sharedAccessType }) && (
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
