import { useContext, useEffect, useState } from 'react';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import FileMenuItem from '../CustomReactMenu/FileMenuItem';
import NavigationIconAndName from '../NavigationIconAndName';
import { FileExplorerContext } from '../FileExplorer';
import { openInNewTab, rootNavigationMap, update } from '../utils/utils';
import { initialTabState } from '../Tabs/constants';
import { axiosClientJSON } from '../endpoint';

const LeftPaneButton = ({ title, handleOnClick }) => {
	const { tabsState, setTabsState, activeTabId, setActiveTabId } =
		useContext(FileExplorerContext);

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
		if (e.button == 1) {
			e.preventDefault();

			handleOpenInNewTab();
		}
	};

	const restoreAllItems = () => {
		axiosClientJSON({
			url: '/restore',
			method: 'POST',
			data: {
				all: true,
			},
		});
	};

	const emptyRecycleBin = () => {
		axiosClientJSON({
			url: '/permanentlyDelete',
			method: 'POST',
			data: {
				all: true,
			},
		});
	};

	return (
		<>
			<button
				onContextMenu={handleOnContextMenu}
				onClick={() => handleOnClick(title)}
				onMouseDown={onMouseDown}
			>
				<NavigationIconAndName folderId={title} />
			</button>

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
					{title == 'Recycle bin' && (
						<>
							<FileMenuItem
								logo={false}
								description="Empty recycle bin"
								onClick={emptyRecycleBin}
							/>
							<FileMenuItem
								logo={false}
								description="Restore all items"
								onClick={restoreAllItems}
							/>
						</>
					)}
				</div>
			</ControlledMenu>
		</>
	);
};

export default LeftPaneButton;
