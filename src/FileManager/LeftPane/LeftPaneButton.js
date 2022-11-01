import { useContext, useEffect, useState } from 'react';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import FileMenuItem from '../CustomReactMenu/FileMenuItem';
import NavigationIconAndName from '../NavigationIconAndName';
import { FileManagerContext } from '../FileManager';
import { openInNewTab, update } from '../utils/utils';
import { initialTabState } from '../Tabs/constants';
import DeleteRestoreConfirmation from '../DeleteRestoreConfirmation';
import useSubscription from '../useSubscription';

const LeftPaneButton = ({ title, handleOnClick }) => {
	const { tabsState, setTabsState, activeTabId, setActiveTabId, setModal } =
		useContext(FileManagerContext);

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

	const handleOnContextMenu = (e) => {
		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	const handleOpenInNewTab = () => {
		const tabId = activeTabId;
		const newTabState = update(initialTabState, {
			path: { $set: [title] },
			history: {
				paths: { $set: [[title]] },
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

			handleOpenInNewTab();
		}
	};

	const restoreAllItems = () => {
		setModal({
			isOpen: true,
			component: DeleteRestoreConfirmation,
			componentProps: {
				type: 'restore',
				data: {
					all: true,
				},
				setTabsState,
				tabsState,
				activeTabId,
			},
		});
	};

	const emptyRecycleBin = () => {
		setModal({
			isOpen: true,
			component: DeleteRestoreConfirmation,
			componentProps: {
				type: 'permanentlyDelete',
				data: {
					all: true,
				},
				setTabsState,
				tabsState,
				activeTabId,
			},
		});
	};

	const recycleBinMenuItemsProps = {
		restoreAllItems,
		emptyRecycleBin,
	};

	return (
		<>
			<a
				className="hover w-full"
				onContextMenu={handleOnContextMenu}
				onClick={() => handleOnClick(title)}
				onMouseDown={onMouseDown}
			>
				<NavigationIconAndName
					folderId={title}
					className={
						tabsState[activeTabId].path[0] === title
							? 'border-l-2 border-conditional-color'
							: ''
					}
				/>
			</a>

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<div onClick={(e) => e.stopPropagation()}>
					<FileMenuItem
						logo="folder"
						description="Open in new tab"
						onClick={handleOpenInNewTab}
					/>
					{title === 'Recycle bin' && (
						<RecycleBinMenuItems {...recycleBinMenuItemsProps} />
					)}
				</div>
			</ControlledMenu>
		</>
	);
};

export default LeftPaneButton;

const RecycleBinMenuItems = ({ restoreAllItems, emptyRecycleBin }) => {
	const [folderData, folderDataLoading, folderDataError] = useSubscription(
		'Recycle bin',
		'folder',
		'aggregate'
	);
	const [fileData, fileDataLoading, fileDataError] = useSubscription(
		'Recycle bin',
		'file',
		'aggregate'
	);
	const [disabled, setDisabled] = useState(true);

	useEffect(() => {
		if (folderData && fileData) {
			const folderCount = folderData.data.folderAggregate.aggregate.count;
			const fileCount = fileData.data.fileAggregate.aggregate.count;
			setDisabled(folderCount + fileCount === 0);
		}
	}, [folderData, fileData]);

	return (
		<>
			<FileMenuItem
				logo={false}
				description="Empty recycle bin"
				onClick={emptyRecycleBin}
				disabled={disabled}
			/>
			<FileMenuItem
				logo={false}
				description="Restore all items"
				onClick={restoreAllItems}
				disabled={disabled}
			/>
		</>
	);
};
