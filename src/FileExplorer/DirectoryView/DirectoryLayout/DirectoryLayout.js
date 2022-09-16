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
	createBuckets,
	dateVariations,
	formatBytes,
	getFolderId,
	update,
} from '../../utils/utils';
import { FileExplorerContext } from '../../FileExplorer';

const initialVisibleColumns = {
	name: true,
	dateCreated: true,
	dateModified: true,
	type: true,
	size: true,
};

const DirectoryLayout = ({
	files,
	folders,
	fileExtensionsMap,
	setFolderArguments,
	setFileArguments,
	filtered,
	setFiltered,
}) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
	} = useContext(FileExplorerContext);
	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [contextMenuOf, setContextMenuOf] = useState(null);

	const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

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
	}, [filtered, fileExtensionsMap]);

	const handleOnContextMenu = (e) => {
		let target = e.target;
		while (
			!target.classList.contains('fileExplorer') &&
			!target.classList.contains('directoryLayoutDetailsHeader') &&
			!target.classList.contains('directoryLayoutFolder') &&
			!target.classList.contains('directoryLayoutFile')
		) {
			target = target.parentElement;
		}
		if (target.classList.contains('directoryLayoutDetailsHeader')) {
			setContextMenuOf('directoryLayoutDetailsHeader');
		} else if (target.classList.contains('directoryLayoutFolder')) {
			setContextMenuOf('directoryLayoutFolder');
		} else if (target.classList.contains('directoryLayoutFile')) {
			setContextMenuOf('directoryLayoutFile');
		} else {
			setContextMenuOf('directoryLayoutEmptySpace');
		}

		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	useEffect(() => {
		const currentFolder =
			tabsState[activeTabId]?.path[tabsState[activeTabId].path.length - 1];
		const folderId = Number.isInteger(currentFolder) ? currentFolder : null;

		if (folderId) {
			setFolderArguments({ where: { parentFolderId: { _eq: folderId } } });
			setFileArguments({ where: { folderId: { _eq: folderId } } });
		} else {
			setFolderArguments({ where: { parentFolderId: { _isNull: true } } });
			setFileArguments({ where: { folderId: { _isNull: true } } });
		}
	}, [tabsState, activeTabId]);

	const fileFolderFilter = (record) => {
		if (localStorage.showHiddenItems) {
			return true;
		} else {
			const name = record.name;
			const nameSplit = name.split('.');
			return nameSplit[0];
		}
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

	const groupRenderProps = {
		files,
		folders,
		fileExtensionsMap,
	};

	return (
		<div
			className="w-full"
			onContextMenu={handleOnContextMenu}
			onClick={handleEmptySpaceOnClick}
		>
			<FileUploadDiv folderId={getFolderId({ tabsState, activeTabId })}>
				<div>
					{Object.entries(filteredGrouped).map(([groupName, items], i) => (
						<GroupRender
							key={i}
							groupName={groupName}
							items={items}
							{...groupRenderProps}
						/>
					))}
				</div>

				<ControlledMenu
					{...menuProps}
					anchorPoint={anchorPoint}
					onClose={() => toggleMenu(false)}
				>
					<div className="w-64">
						{contextMenuOf == 'directoryLayoutDetailsHeader' && (
							<>
								<FileMenuItem
									controlledStatePadding={true}
									description="Size all columns to fit"
								/>
								<MenuDivider />
								{Object.entries(visibleColumns).map(([column, value]) => (
									<FileMenuItem
										type="checkbox"
										checked={value}
										onClick={(e) =>
											setVisibleColumns({
												...visibleColumns,
												[column]: e.checked,
											})
										}
										description={column}
									/>
								))}
							</>
						)}
						{contextMenuOf == 'directoryLayoutFolder' && (
							<>
								<FileFocusableItem title="cut" icon="cut" />
								<FileFocusableItem title="copy" icon="content_copy" />
								<FileFocusableItem title="paste" icon="content_paste" />
								<FileFocusableItem
									title="share"
									icon="drive_file_rename_outline"
								/>
								<FileFocusableItem title="delete" icon="delete" />
								<MenuDivider />
								<FileMenuItem description="Open in new tab" />
								<FileMenuItem description="Add to favorites" />
							</>
						)}
						{contextMenuOf == 'directoryLayoutFile' && (
							<>
								<FileFocusableItem title="cut" icon="cut" />
								<FileFocusableItem title="copy" icon="content_copy" />
								<FileFocusableItem title="paste" icon="content_paste" />
								<FileFocusableItem
									title="share"
									icon="drive_file_rename_outline"
								/>
								<FileFocusableItem title="delete" icon="delete" />
								<MenuDivider />
								<FileMenuItem description="Create folder with selection" />
							</>
						)}

						{contextMenuOf == 'directoryLayoutEmptySpace' && <></>}
					</div>
				</ControlledMenu>
			</FileUploadDiv>
		</div>
	);
};

export default DirectoryLayout;

const GroupRender = ({
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

	const fileFolderRenderProps = {
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
				<>
					{itemsSorted.map((item) => (
						<FileFolderRender
							key={`${item.type}-${item.id}`}
							item={item}
							{...fileFolderRenderProps}
						/>
					))}
				</>
			)}
		</>
	);
};

const FileFolderRender = ({ item, getRecord, fileExtensionsMap }) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
	} = useContext(FileExplorerContext);

	const [record, setRecord] = useState({});

	useEffect(() => {
		setRecord(getRecord(item));
	}, [item]);

	const handleSelectFileFolderOnClick = (e, id, type) => {
		e.stopPropagation(); // allows empty space to be clicked to clear all folders or files selected
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		let tempSelectedFolders;
		let tempSelectedFiles;

		if (type == 'folder') {
			if (!localStorage.multiselect) {
				tempSelectedFolders = [id];
				tempSelectedFiles = [];
			} else {
				tempSelectedFiles = selectedFiles;
				if (selectedFolders.includes(id)) {
					tempSelectedFolders = [...selectedFolders];
					const index = tempSelectedFolders.findIndex((el) => el == id);
					tempSelectedFolders.splice(index, 1);
				} else {
					tempSelectedFolders = [...selectedFolders, id];
				}
			}
		} else if (type == 'file') {
			if (!localStorage.multiselect) {
				tempSelectedFiles = [id];
				tempSelectedFolders = [];
			} else {
				tempSelectedFolders = selectedFolders;
				if (selectedFiles.includes(id)) {
					tempSelectedFiles = [...selectedFiles];
					const index = tempSelectedFiles.findIndex((el) => el == id);
					tempSelectedFiles.splice(index, 1);
				} else {
					tempSelectedFiles = [...selectedFiles, id];
				}
			}
		}

		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: tempSelectedFiles },
					selectedFolders: { $set: tempSelectedFolders },
				},
			})
		);
	};

	const renderDate = (date) => {
		if (!date) return '';
		return new Date(date).toGMTString();
	};

	const renderType = (record) => {
		if (record.__typename == 'Folder') {
			return 'File folder';
		} else {
			const ext = (record.name ?? '').split('.').pop();
			let fullName = fileExtensionsMap?.[ext]?.fullName;
			return fullName ? fullName : ext.toUpperCase() + ' file';
		}
	};

	const renderProps = {
		renderType,
		renderDate,
		handleSelectFileFolderOnClick,
		record,
	};

	const renderFileProps = {
		fileExtensionsMap,
	};

	return (
		<>
			{record && (
				<>
					{item.type == 'folder' && <RenderFolder {...renderProps} />}

					{item.type == 'file' && (
						<RenderFile {...renderProps} {...renderFileProps} />
					)}
				</>
			)}
		</>
	);
};

const RenderFolder = ({
	record,
	renderDate,
	renderType,
	handleSelectFileFolderOnClick,
}) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
	} = useContext(FileExplorerContext);

	const updateCurrentFolderId = (folderId) => {
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					path: { $push: [folderId] },
					selectedFiles: { $set: [] }, // clears selected files
					selectedFolders: { $set: [] }, // clears selected folders
				},
			})
		);
	};

	return (
		<FileUploadDiv folderId={record.id}>
			<div
				className={
					'directoryLayoutFolder flex ' +
					(tabsState[activeTabId].selectedFolders.includes(record.id)
						? 'bg-zinc-500'
						: '')
				}
				onClick={(e) => handleSelectFileFolderOnClick(e, record.id, 'folder')}
				onDoubleClick={() => updateCurrentFolderId(record.id)}
			>
				<div style={{ width: '25%' }}>{record.name}</div>
				<div style={{ width: '25%' }}>{renderDate(record.meta?.modified)}</div>
				<div style={{ width: '25%' }}>{renderType(record)}</div>
				<div style={{ width: '25%' }}></div>
			</div>
		</FileUploadDiv>
	);
};

const RenderFile = ({
	record,
	renderDate,
	renderType,
	handleSelectFileFolderOnClick,
	fileExtensionsMap,
}) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
	} = useContext(FileExplorerContext);

	const renderFileName = (name = '') => {
		const nameSplit = name.split('.');
		// !localStorage.showFileExtensions && localStorage.showHiddenItems, this is because a hidden item starts with a dot(.), so the rest of the name should not be considered a extension
		if (
			localStorage.showFileExtensions ||
			(!localStorage.showFileExtensions &&
				localStorage.showHiddenItems &&
				!nameSplit[0])
		) {
			return name;
		} else {
			return nameSplit.slice(0, nameSplit.length - 1).join('.');
		}
	};

	return (
		<div
			className={
				'directoryLayoutFolder flex ' +
				(tabsState[activeTabId].selectedFiles.includes(record.id)
					? 'bg-zinc-500'
					: '')
			}
			onClick={(e) => handleSelectFileFolderOnClick(e, record.id, 'file')}
		>
			<div style={{ width: '25%' }}>{renderFileName(record.name)}</div>
			<div style={{ width: '25%' }}>{renderDate(record.meta?.modified)}</div>
			<div style={{ width: '25%' }}>{renderType(record)}</div>
			<div style={{ width: '25%' }}>{formatBytes(record.size)}</div>
		</div>
	);
};
