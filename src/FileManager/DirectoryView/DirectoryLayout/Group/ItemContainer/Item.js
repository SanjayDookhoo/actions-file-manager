import {
	ControlledMenu,
	MenuDivider,
	MenuHeader,
	useMenuState,
} from '@szhsin/react-menu';
import {
	Fragment,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import FileMenuItem from '../../../../CustomReactMenu/FileMenuItem';
import FileUploadDiv from '../../../../FileUploadDiv/FileUploadDiv';
import Layout from './Layout/Layout';

import { FileManagerContext } from '../../../../FileManager';
import { openInNewTab, update } from '../../../../utils/utils';
import FilesOptions from '../../../../FilesOptions/FilesOptions';
import DeleteRestoreConfirmation from '../../../../DeleteRestoreConfirmation';
import {
	audioTypes,
	imageTypes,
	videoTypes,
} from '../../../../utils/constants';
import Video from '../../../../Video';
import Audio from '../../../../Audio';
import Gallery from '../../../../Gallery';
import { toast } from 'react-toastify';

const Item = ({
	item,
	groupIndex,
	itemIndex,
	setItemWidth,
	getRecord,
	handleOnKeyDown,
	newGroupItemFocus,
	setNewGroupItemFocus,
	imageGalleryOrdered,
}) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setModal,
		actions,
		fileManagerRef,
		axiosClientJSON,
	} = useContext(FileManagerContext);

	const [record, setRecord] = useState(null);
	const [menuProps, toggleMenuHeader] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const itemRef = useRef();
	const [keydown, setKeydown] = useState(0);
	const [groupActions, setGroupActions] = useState({});

	useEffect(() => {
		let tempGroupActions = {};
		if (actions) {
			if (Array.isArray(actions)) {
				tempGroupActions = {
					actions: actions,
				};
			} else {
				tempGroupActions = actions;
			}
		}

		setGroupActions(tempGroupActions);
	}, [actions]);

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
				(__typename === 'folder' && selectedFolders.includes(id)) ||
				(__typename === 'file' && selectedFiles.includes(id))
			)
		) {
			// since the item right clicked was not selected, deselect everything else and only select the item right clicked
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						selectedFiles: { $set: __typename === 'file' ? [id] : [] },
						selectedFolders: { $set: __typename === 'folder' ? [id] : [] },
					},
				})
			);
		}
	};

	const canDownload = () => {
		const { path } = tabsState[activeTabId];
		if (path[0] === 'Recycle bin') return false;
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
		setModal({
			isOpen: true,
			component: DeleteRestoreConfirmation,
			componentProps: {
				type: 'restore',
				data: {
					selectedFolders,
					selectedFiles,
				},
				setTabsState,
				tabsState,
				activeTabId,
			},
		});
	};

	const permanentlyDelete = () => {
		const { selectedFolders, selectedFiles } = tabsState[activeTabId];
		setModal({
			isOpen: true,
			component: DeleteRestoreConfirmation,
			componentProps: {
				type: 'permanentlyDelete',
				data: {
					selectedFolders,
					selectedFiles,
				},
				setTabsState,
				tabsState,
				activeTabId,
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
		if (e.button === 1) {
			e.preventDefault();

			if (item.__typename === 'folder') {
				handleOpenInNewTab();
			}
		}
	};

	const handleSelectFileFolderOnClick = (e) => {
		// allows empty space to be clicked to clear all folders or files selected
		e.stopPropagation();

		// if clicked by mouse event, changes the focus to allow keyboard events to work
		setNewGroupItemFocus({
			groupIndex,
			itemIndex,
			event: 'mouse',
		});
	};

	// on arrow keydown, the item focused and highlighted changes
	useLayoutEffect(() => {
		if (
			record &&
			itemIndex === newGroupItemFocus?.itemIndex &&
			groupIndex === newGroupItemFocus?.groupIndex
		) {
			const multiselect =
				newGroupItemFocus.event === 'mouse' ? localStorage.multiselect : false;
			const { id, __typename } = record;
			const { selectedFolders, selectedFiles } = tabsState[activeTabId];
			let tempSelectedFolders;
			let tempSelectedFiles;

			if (__typename === 'folder') {
				if (!multiselect) {
					tempSelectedFolders = [id];
					tempSelectedFiles = [];
				} else {
					tempSelectedFiles = selectedFiles;
					if (selectedFolders.includes(id)) {
						tempSelectedFolders = [...selectedFolders];
						const index = tempSelectedFolders.findIndex((el) => el === id);
						tempSelectedFolders.splice(index, 1);
					} else {
						tempSelectedFolders = [...selectedFolders, id];
					}
				}
			} else if (__typename === 'file') {
				if (!multiselect) {
					tempSelectedFiles = [id];
					tempSelectedFolders = [];
				} else {
					tempSelectedFolders = selectedFolders;
					if (selectedFiles.includes(id)) {
						tempSelectedFiles = [...selectedFiles];
						const index = tempSelectedFiles.findIndex((el) => el === id);
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
			itemRef.current.focus();
		}
	}, [record, newGroupItemFocus, itemIndex, groupIndex]);

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

	useLayoutEffect(() => {
		if (record && itemIndex === 0) {
			const item = itemRef.current;
			const handleResizeObserver = () => {
				const width = item.offsetWidth;
				setItemWidth(width);
			};
			const observer = new ResizeObserver(handleResizeObserver);
			observer.observe(item);
			return () => {
				observer.unobserve(item);
			};
		}
	}, [record, itemIndex]);

	// if a new folder has been entered, and no item has been selected yet, sets the initial focus to be the first item
	useLayoutEffect(() => {
		if (
			record &&
			itemIndex === 0 &&
			groupIndex === 0 &&
			!newGroupItemFocus &&
			keydown !== 0
		) {
			setNewGroupItemFocus({
				groupIndex,
				itemIndex,
			});
		}
	}, [record, keydown, itemIndex, groupIndex, newGroupItemFocus]);

	// if first first item, then this facilitates knowing when the first arrow key is pressed
	useEffect(() => {
		if (itemIndex === 0 && groupIndex === 0) {
			const fileManager = fileManagerRef.current;

			const handleKeydown = (e) => {
				const { keyCode } = e;
				if ([37, 38, 39, 40].includes(keyCode)) {
					setKeydown(Math.random());
				}
			};

			fileManager.addEventListener('keydown', handleKeydown);

			return () => {
				fileManager.removeEventListener('keydown', handleKeydown);
			};
		}
	}, [record, itemIndex, groupIndex]);

	const handleFileDoubleClick = async () => {
		const { name, id, mimeType } = record;

		const ext = (name ?? '').split('.').pop();
		const res = await axiosClientJSON({
			url: '/downloadFile',
			method: 'POST',
			data: {
				id,
			},
		});
		const { URL } = res.data;

		if (videoTypes.includes(ext) && mimeType.includes('video')) {
			setModal({
				isOpen: true,
				component: Video,
				componentProps: { URL, ext },
			});
		} else if (audioTypes.includes(ext) && mimeType.includes('audio')) {
			setModal({
				isOpen: true,
				component: Audio,
				componentProps: { URL, ext },
			});
		} else if (imageTypes.includes(ext)) {
			setModal({
				isOpen: true,
				component: Gallery,
				componentProps: { imageGalleryOrdered, record },
			});
		} else {
			window.location.assign(URL);
		}
	};

	const handleDoubleClick = () => {
		if (record.__typename === 'folder') {
			updateCurrentFolderId();
		} else {
			handleFileDoubleClick();
		}
	};

	const _handleOnKeyDown = (e) => {
		const { keyCode } = e;
		if (
			itemIndex === newGroupItemFocus?.itemIndex &&
			groupIndex === newGroupItemFocus?.groupIndex &&
			keyCode === 13
		) {
			handleDoubleClick();
		}
		handleOnKeyDown({ e, groupIndex, itemIndex });
	};

	const layoutProps = {
		record,
	};

	return (
		<>
			{record && (
				<div
					className="outline-none select-none"
					tabIndex={-1}
					ref={itemRef}
					onContextMenu={handleOnContextMenu}
					onMouseDown={onMouseDown}
					onClick={handleSelectFileFolderOnClick}
					onDoubleClick={handleDoubleClick}
					onKeyDown={_handleOnKeyDown}
				>
					{item.__typename === 'folder' && (
						<FileUploadDiv folderId={record.id}>
							<Layout {...layoutProps} />
						</FileUploadDiv>
					)}

					{item.__typename === 'file' && (
						<div
							// similar class to what FileUploadDiv uses, without the hover over with files effect
							className={
								'p-1 w-fit h-fit border-dashed border border-transparent'
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
							{tabsState[activeTabId].path[0] === 'Recycle bin' &&
								tabsState[activeTabId].path.length === 1 && (
									<>
										<FileMenuItem description="Restore" onClick={restore} />
										<FileMenuItem
											description="Permanently Delete"
											onClick={permanentlyDelete}
										/>
									</>
								)}
							{record.__typename === 'folder' ? (
								<>
									{tabsState[activeTabId].path[0] === 'Recycle bin' &&
										tabsState[activeTabId].path.length === 1 && <MenuDivider />}
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
							{/* context menu actions */}
							{Object.entries(groupActions).map(([groupName, actions]) => (
								<Fragment key={groupName}>
									{actions.filter((action) => action.displayCondition(record)) // if no action to display, dont show divider and header
										.length !== 0 && (
										<>
											<MenuDivider />
											<MenuHeader>{groupName}</MenuHeader>
										</>
									)}
									{actions.map((action) => (
										<Fragment key={action.description}>
											{action.displayCondition(record) && (
												<FileMenuItem
													description={action.description}
													onClick={() =>
														action.function(record, toast, setModal)
													}
												/>
											)}
										</Fragment>
									))}
								</Fragment>
							))}
						</div>
					</ControlledMenu>
				</div>
			)}
		</>
	);
};

export default Item;
