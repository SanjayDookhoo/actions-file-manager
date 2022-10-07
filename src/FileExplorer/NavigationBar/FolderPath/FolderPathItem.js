import { ControlledMenu, useMenuState } from '@szhsin/react-menu';
import { useContext, useState } from 'react';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { FileExplorerContext } from '../../FileExplorer';
import FolderName from '../../FolderName';
import { openInNewTab, update } from '../../utils/utils';

const FolderPathItem = ({ folderId, i }) => {
	const { tabsState, setTabsState, activeTabId, setActiveTabId } =
		useContext(FileExplorerContext);

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

	const handleOnContextMenu = (e) => {
		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	const handleFolderPathOnClick = () => {
		if (folderId == [...tabsState[activeTabId].path].reverse()[0]) {
			// if the last path is clicked, just reset the selected folders and files
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						// clearing other selected files and folders
						selectedFolders: {
							$set: [],
						},
						selectedFiles: {
							$set: [],
						},
					},
				})
			);
		} else {
			const index = tabsState[activeTabId].path.findIndex(
				(el) => el == folderId
			);
			let newPath = [...tabsState[activeTabId].path];
			newPath = newPath.slice(0, index + 1);
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						// adding path in a way that allows keeping track of history
						path: { $set: newPath },
						history: {
							paths: { $push: [newPath] },
							currentIndex: { $apply: (val) => val + 1 },
						},
						// clearing other selected files and folders
						selectedFolders: {
							$set: [],
						},
						selectedFiles: {
							$set: [],
						},
					},
				})
			);
		}
	};

	const handleOpenInNewTab = () => {
		const tabId = activeTabId;
		let newTabState;
		if (folderId == [...tabsState[activeTabId].path].reverse()[0]) {
			newTabState = update(tabsState[activeTabId], {
				// clearing other selected files and folders
				selectedFolders: {
					$set: [],
				},
				selectedFiles: {
					$set: [],
				},
			});
		} else {
			const index = tabsState[activeTabId].path.findIndex(
				(el) => el == folderId
			);
			let newPath = [...tabsState[activeTabId].path];
			newPath = newPath.slice(0, index + 1);
			newTabState = update(tabsState[activeTabId], {
				path: { $set: newPath },
				history: {
					paths: { $push: [newPath] },
					currentIndex: { $apply: (val) => val + 1 },
				},
				// clearing other selected files and folders
				selectedFolders: {
					$set: [],
				},
				selectedFiles: {
					$set: [],
				},
			});
		}

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

			handleOpenInNewTab();
		}
	};
	return (
		<div
			className={
				'flex align-center ' +
				(i != tabsState[activeTabId]?.path.length - 1 ? 'cursor-pointer' : '')
			}
			onContextMenu={handleOnContextMenu}
			onClick={handleFolderPathOnClick}
			onMouseDown={onMouseDown}
		>
			<FolderName folderId={folderId} />
			{i != tabsState[activeTabId]?.path.length - 1 && (
				<span className="material-symbols-outlined">chevron_right</span>
			)}

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<div onClick={(e) => e.stopPropagation()}>
					<FileMenuItem
						description="Open in new tab"
						onClick={handleOpenInNewTab}
					/>
				</div>
			</ControlledMenu>
		</div>
	);
};

export default FolderPathItem;
