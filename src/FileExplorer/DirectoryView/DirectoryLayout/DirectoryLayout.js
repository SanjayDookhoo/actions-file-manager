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
				style={{ width: '100%', minHeight: '100%' }}
			>
				<div>
					{layout == 'details' && (
						<div className="sticky top-0 bg-gray-500">
							<DragDropContext onDragEnd={handleOnDragEnd}>
								<Droppable droppableId="droppable" direction="horizontal">
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.droppableProps}
											className="flex pl-6"
										>
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
																		className="flex justify-between items-center text-ellipsis overflow-hidden whitespace-nowrap px-2"
																		style={{ width: meta.width }}
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
