import { ControlledMenu, MenuDivider, useMenuState } from '@szhsin/react-menu';
import { useContext, useEffect, useState } from 'react';
import FileFocusableItem from '../../../../CustomReactMenu/FileFocusableItem';
import FileMenuItem from '../../../../CustomReactMenu/FileMenuItem';
import FileUploadDiv from '../../../../FileUploadDiv/FileUploadDiv';
import Layout from './Layout/Layout';

import { axiosClientJSON } from '../../../../endpoint';
import { FileExplorerContext } from '../../../../FileExplorer';
import { openInNewTab, update } from '../../../../utils/utils';

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
	};

	const downloadFile = (record) => {
		const { id } = record;

		axiosClientJSON({
			url: '/downloadFile',
			method: 'POST',
			data: {
				id,
			},
		}).then((res) => {
			const { URL } = res.data;
			window.open(URL, '_blank');
		});
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

	const share = () => {
		setSharingLinksIsOpen(record);
	};

	const layoutProps = {
		record,
	};

	return (
		<>
			{record && (
				<div onContextMenu={handleOnContextMenu} onMouseDown={onMouseDown}>
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
							<FileFocusableItem title="cut" icon="cut" />
							<FileFocusableItem title="copy" icon="content_copy" />
							<FileFocusableItem title="paste" icon="content_paste" />
							<FileFocusableItem
								title="rename"
								icon="drive_file_rename_outline"
							/>
							<FileFocusableItem title="delete" icon="delete" />
							<MenuDivider />
							<FileMenuItem description="Restore" onClick={restore} />
							<FileMenuItem
								description="Permanently Delete"
								onClick={permanentlyDelete}
							/>
							<FileMenuItem description="Share" onClick={share} />
							<MenuDivider />
							{record.__typename == 'Folder' ? (
								<>
									<FileMenuItem
										description="Open in new tab"
										onClick={handleOpenInNewTab}
									/>
									{/* <FileMenuItem description="Add to favorites" /> */}
									<FileMenuItem description="Create folder with selection" />
								</>
							) : (
								<>
									<FileMenuItem
										description="Download"
										onClick={() => downloadFile(record)}
									/>
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
