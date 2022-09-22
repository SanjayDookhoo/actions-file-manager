import { ControlledMenu, MenuDivider, useMenuState } from '@szhsin/react-menu';
import { useContext, useEffect, useState } from 'react';
import FileFocusableItem from '../../../../CustomReactMenu/FileFocusableItem';
import FileMenuItem from '../../../../CustomReactMenu/FileMenuItem';
import FileUploadDiv from '../../../../FileUploadDiv/FileUploadDiv';
import Layout from './Layout/Layout';

import { axiosClientJSON } from '../../../../endpoint';
import { FileExplorerContext } from '../../../../FileExplorer';
import { openInNewTab, update } from '../../../../utils/utils';
import FilesOptions from '../../../../FilesOptions/FilesOptions';

const Item = ({ item, getRecord }) => {
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
		setSharingLinksIsOpen,
	} = useContext(FileExplorerContext);

	const [record, setRecord] = useState({});
	const [menuProps, toggleMenuHeader] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

	useEffect(() => {
		setRecord(getRecord(item));
	}, [item]);

	const handleOnContextMenu = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenuHeader(true);

		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		const { id, __typename } = item;

		if (
			!(
				(__typename == 'Folder' && selectedFolders.includes(id)) ||
				(__typename == 'File' && selectedFiles.includes(id))
			)
		) {
			// since the item right clicked was not selected, deselect everything else and only select the item right clicked
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						selectedFiles: { $set: __typename == 'File' ? [id] : [] },
						selectedFolders: { $set: __typename == 'Folder' ? [id] : [] },
					},
				})
			);
		}
	};

	const canDownload = () => {
		const { path } = tabsState[activeTabId];
		if (path[0] == 'Recycle bin') return false;
		return true;
	};

	const downloadFile = () => {
		if (canDownload()) {
			const { id } = record;

			axiosClientJSON({
				url: '/downloadFile',
				method: 'POST',
				data: {
					id,
				},
			}).then((res) => {
				const { URL } = res.data;
				window.location.assign(URL);
			});
		}
	};

	const restore = () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		axiosClientJSON({
			url: '/restore',
			method: 'POST',
			data: {
				selectedFolders,
				selectedFiles,
			},
		});
	};

	const permanentlyDelete = () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		axiosClientJSON({
			url: '/permanentlyDelete',
			method: 'POST',
			data: {
				selectedFolders,
				selectedFiles,
			},
		});
	};

	const handleOpenInNewTab = () => {
		const tabId = activeTabId;
		const { path } = tabsState[tabId];
		const newPath = [...path, record.id];
		const newTabState = update(tabsState[activeTabId], {
			path: { $set: newPath },
			history: {
				paths: { $push: [newPath] },
				currentIndex: { $apply: (val) => val + 1 },
			},
		});

		openInNewTab({
			tabsState,
			tabId,
			setActiveTabId,
			setTabsState,
			newTabState,
		});
	};

	const onMouseDown = (e) => {
		// middle mouse button handle
		if (e.button == 1) {
			e.preventDefault();

			if (item.__typename == 'Folder') {
				handleOpenInNewTab();
			}
		}
	};

	const handleSelectFileFolderOnClick = (e) => {
		const { id, __typename } = record;
		e.stopPropagation(); // allows empty space to be clicked to clear all folders or files selected
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		let tempSelectedFolders;
		let tempSelectedFiles;

		if (__typename == 'Folder') {
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
		} else if (__typename == 'File') {
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

	const updateCurrentFolderId = () => {
		const { paths, currentIndex } = tabsState[activeTabId].history;
		const newPath = [...tabsState[activeTabId].path, record.id];
		let newPaths = [...paths];
		newPaths = newPaths.splice(0, currentIndex + 1);
		newPaths = [...newPaths, newPath];
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					// adding path in a way that allows keeping track of history
					path: { $set: newPath },
					history: {
						paths: { $set: newPaths },
						currentIndex: { $apply: (val) => val + 1 },
					},
					// clearing other selected files and folders
					selectedFiles: { $set: [] },
					selectedFolders: { $set: [] },
				},
			})
		);
	};

	const layoutProps = {
		record,
	};

	return (
		<>
			{record && (
				<div
					onContextMenu={handleOnContextMenu}
					onMouseDown={onMouseDown}
					onClick={handleSelectFileFolderOnClick}
					onDoubleClick={
						record.__typename == 'Folder'
							? () => updateCurrentFolderId()
							: () => downloadFile()
					}
				>
					{item.__typename == 'Folder' && (
						<FileUploadDiv folderId={record.id}>
							<Layout {...layoutProps} />
						</FileUploadDiv>
					)}

					{item.__typename == 'File' && (
						<div
							// similar class to what FileUploadDiv uses, without the hover over with files effect
							className={
								'm-1 p-1 w-fit h-fit border-dashed border border-transparent'
							}
						>
							<Layout {...layoutProps} />
						</div>
					)}

					<ControlledMenu
						{...menuProps}
						anchorPoint={anchorPoint}
						onClose={() => toggleMenuHeader(false)}
					>
						<div className="w-64" onClick={(e) => e.stopPropagation()}>
							<FilesOptions item={true} />
							<MenuDivider />
							{tabsState[activeTabId].path[0] == 'Recycle bin' &&
								tabsState[activeTabId].path.length == 1 && (
									<>
										<FileMenuItem description="Restore" onClick={restore} />
										<FileMenuItem
											description="Permanently Delete"
											onClick={permanentlyDelete}
										/>
										<MenuDivider />
									</>
								)}
							{record.__typename == 'Folder' ? (
								<>
									<FileMenuItem
										description="Open in new tab"
										onClick={handleOpenInNewTab}
									/>
									{/* <FileMenuItem description="Add to favorites" /> */}
									{/* <FileMenuItem description="Create folder with selection" /> */}
								</>
							) : (
								<>
									{canDownload() && (
										<FileMenuItem
											description="Download"
											onClick={downloadFile}
										/>
									)}
								</>
							)}
						</div>
					</ControlledMenu>
				</div>
			)}
		</>
	);
};

export default Item;
