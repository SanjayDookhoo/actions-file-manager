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
import defaultFile from '../../assets/defaultFile.webp';
import folder from '../../assets/folder.svg';
import Group from './Group/Group';

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

	const groupProps = {
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
			<FileUploadDiv
				folderId={getFolderId({ tabsState, activeTabId })}
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
									<div style={{ width: meta.width }}>{key}</div>
								))}
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
