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
import { getFolderId, update } from '../../utils/utils';
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
	setFolderArguments,
	setFileArguments,
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

	const renderFilename = (filename) => {
		const filenameSplit = filename.split('.');
		// !localStorage.showFileExtensions && localStorage.showHiddenItems, this is because a hidden item starts with a dot(.), so the rest of the filename should not be considered a extension
		if (
			localStorage.showFileExtensions ||
			(!localStorage.showFileExtensions &&
				localStorage.showHiddenItems &&
				!filenameSplit[0])
		) {
			return filename;
		} else {
			return filenameSplit.slice(0, filenameSplit.length - 1).join('.');
		}
	};

	const fileFolderFilter = (record, type) => {
		if (localStorage.showHiddenItems) {
			return true;
		} else {
			const name = record[`${type}Name`]; // fileName || folderName
			const nameSplit = name.split('.');
			return nameSplit[0];
		}
	};

	const handleSelectFileFolderOnClick = (e, record, type) => {
		e.stopPropagation(); // allows empty space to be clicked to clear all folders or files selected
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		let tempSelectedFolders;
		let tempSelectedFiles;

		if (type == 'folder') {
			if (!localStorage.multiselect) {
				tempSelectedFolders = [record.id];
				tempSelectedFiles = [];
			} else {
				tempSelectedFiles = selectedFiles;
				if (selectedFolders.includes(record.id)) {
					tempSelectedFolders = [...selectedFolders];
					const index = tempSelectedFolders.findIndex((el) => el == record.id);
					tempSelectedFolders.splice(index, 1);
				} else {
					tempSelectedFolders = [...selectedFolders, record.id];
				}
			}
		} else if (type == 'file') {
			if (!localStorage.multiselect) {
				tempSelectedFiles = [record.id];
				tempSelectedFolders = [];
			} else {
				tempSelectedFolders = selectedFolders;
				if (selectedFiles.includes(record.id)) {
					tempSelectedFiles = [...selectedFiles];
					const index = tempSelectedFiles.findIndex((el) => el == record.id);
					tempSelectedFiles.splice(index, 1);
				} else {
					tempSelectedFiles = [...selectedFiles, record.id];
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

	return (
		<div
			className="w-full"
			onContextMenu={handleOnContextMenu}
			onClick={handleEmptySpaceOnClick}
		>
			<FileUploadDiv folderId={getFolderId({ tabsState, activeTabId })}>
				<div>
					{folders
						.filter((record) => fileFolderFilter(record, 'folder'))
						.map((folder) => (
							<FileUploadDiv key={folder.id} folderId={folder.id}>
								<div
									className={
										'directoryLayoutFolder flex ' +
										(tabsState[activeTabId].selectedFolders.includes(folder.id)
											? 'bg-zinc-500'
											: '')
									}
									onClick={(e) =>
										handleSelectFileFolderOnClick(e, folder, 'folder')
									}
									onDoubleClick={() => updateCurrentFolderId(folder.id)}
								>
									<div style={{ width: '25%' }}>{folder.folderName}</div>
									<div style={{ width: '25%' }}>a</div>
									<div style={{ width: '25%' }}>b</div>
									<div style={{ width: '25%' }}>c</div>
								</div>
							</FileUploadDiv>
						))}
					{files
						.filter((record) => fileFolderFilter(record, 'file'))
						.map((file) => (
							<div
								key={file.id}
								className={
									'directoryLayoutFolder flex ' +
									(tabsState[activeTabId].selectedFiles.includes(file.id)
										? 'bg-zinc-500'
										: '')
								}
								onClick={(e) => handleSelectFileFolderOnClick(e, file, 'file')}
							>
								<div style={{ width: '25%' }}>
									{renderFilename(file.fileName)}
								</div>
								<div style={{ width: '25%' }}>a</div>
								<div style={{ width: '25%' }}>b</div>
								<div style={{ width: '25%' }}>c</div>
							</div>
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
