import { ControlledMenu, useMenuState } from '@szhsin/react-menu';
import { useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { FileExplorerContext } from '../../FileExplorer';
import FolderName from '../../FolderName';
import NavigationIconAndName from '../../NavigationIconAndName';
import { buttonStyle } from '../../utils/constants';
import { isMacOs, openInNewTab, shortcutHint } from '../../utils/utils';
import { tabMaxWidth, tabMinWidth } from '../constants';

const icon = 'folder';

const Tab = (props) => {
	const {
		tabWidth,
		tabId,
		inContextMenu,
		addNewTab,
		reopenClosedTab,
		closeTab,
	} = props;
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		fileExplorerRef,
		closedTabs,
		setClosedTabs,
	} = useContext(FileExplorerContext);
	const [width, setWidth] = useState(tabMaxWidth);
	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	// Because .reverse modifies the originally array, apply it to a copy of the array
	const folderId = [...tabsState[tabId].path].reverse()[0];

	useEffect(() => {
		if (tabWidth) {
			if (tabWidth > tabMaxWidth) {
				setWidth(tabMaxWidth);
			} else if (tabWidth < tabMinWidth) {
				setWidth(tabMinWidth);
			} else {
				setWidth(tabWidth);
			}
		} else {
			setWidth('100%');
		}
	}, [tabWidth]);

	const handleClose = (e) => {
		e.stopPropagation(); // used in context menu
		closeTab(tabId);
	};

	const onMouseDown = (e) => {
		// middle mouse button handle
		if (e.button == 1) {
			e.preventDefault();

			if (Object.keys(tabsState).length != 1) {
				handleClose(e);
			}
		}
	};

	const handleOnClick = () => {
		setActiveTabId(tabId);
	};

	const duplicateTab = () => {
		const newTabState = tabsState[tabId];
		openInNewTab({
			tabsState,
			tabId,
			setActiveTabId,
			setTabsState,
			newTabState,
		});
	};

	const canCloseTabsLeft = () => {
		const tempTabsState = { ...tabsState };
		const currTab = tempTabsState[tabId];
		const { order } = currTab;

		return (
			Object.keys(tempTabsState).filter(
				(key) => tempTabsState[key].order < order
			).length != 0
		);
	};

	const canCloseTabsRight = () => {
		const tempTabsState = { ...tabsState };
		const currTab = tempTabsState[tabId];
		const { order } = currTab;

		return (
			Object.keys(tempTabsState).filter(
				(key) => tempTabsState[key].order > order
			).length != 0
		);
	};

	const canCloseTabsOther = () => {
		return canCloseTabsLeft() || canCloseTabsRight();
	};

	const closeTabsLeft = ({ data }) => {
		const { tempTabsState, order } = data;

		const extraToDelete = Object.keys(tempTabsState)
			.filter((key) => tempTabsState[key].order < order)
			.sort((a, b) => tempTabsState[a].order + tempTabsState[b].order);

		data.toDelete = [...data.toDelete, ...extraToDelete];
	};

	const closeTabsRight = ({ data }) => {
		const { tempTabsState, order } = data;

		const extraToDelete = Object.keys(tempTabsState)
			.filter((key) => tempTabsState[key].order > order)
			.sort((a, b) => tempTabsState[a].order - tempTabsState[b].order);

		data.toDelete = [...data.toDelete, ...extraToDelete];
	};

	const closeTabs = (type) => {
		const tempTabsState = { ...tabsState };
		const currTab = tempTabsState[tabId];
		const { order } = currTab;
		const extraClosedTabs = {};

		const data = { tempTabsState, order, toDelete: [] };

		if (type == 'left' || type == 'other') closeTabsLeft({ data });
		if (type == 'right' || type == 'other') closeTabsRight({ data });

		data.toDelete.forEach((key) => {
			if (key == activeTabId) setActiveTabId(tabId);
			extraClosedTabs[key] = tempTabsState[key];
			delete tempTabsState[key];
		});

		setClosedTabs({ ...extraClosedTabs, ...closedTabs });
		setTabsState(tempTabsState);
	};

	const handleOnContextMenu = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	const controlledMenuPortal = {
		target: fileExplorerRef.current,
		stablePosition: true,
		// https://szhsin.github.io/react-menu/docs
		// search "portal"
	};

	return (
		<div
			className={inContextMenu ? 'tab pb-1' : 'tab pr-1 pt-1'}
			style={{ width }}
			onClick={handleOnClick}
			onContextMenu={handleOnContextMenu}
			onMouseDown={onMouseDown}
		>
			{/* a extra padding container used here instead of margin, because that margin is not tied to the width like padding is */}
			<div
				className={
					'p-1 h-8 flex justify-between items-center ' +
					(inContextMenu ? 'rounded-lg ' : 'rounded-tl-lg rounded-tr-lg ') +
					(activeTabId == tabId ? 'bg-zinc-800 ' : '')
				}
			>
				<div
					className="flex items-center"
					style={{ width: 'calc(100% - 32px)' }}
				>
					{/* the width calc minuses the size of the close button */}
					<NavigationIconAndName folderId={folderId} />
				</div>
				{Object.keys(tabsState).length != 1 && (
					<a
						className=""
						title={`Close tab (Ctrl+Alt+W)`}
						onClick={handleClose}
					>
						<span className={buttonStyle}>close</span>
					</a>
				)}
			</div>

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				portal={controlledMenuPortal}
				onClose={() => toggleMenu(false)}
				onClick={(e) => e.stopPropagation()} // prevents propagation of clicks, because the div it is nested in is also using an onClick
			>
				<FileMenuItem
					logo="folder"
					description="New tab"
					shortcutHint={shortcutHint(`Ctrl+Alt+T`)}
					onClick={addNewTab}
				/>
				<FileMenuItem
					logo="folder"
					description="Duplicate tab"
					onClick={duplicateTab}
				/>
				<FileMenuItem
					logo={false}
					description="Close tabs to the left"
					onClick={() => closeTabs('left')}
					disabled={!canCloseTabsLeft()}
				/>
				<FileMenuItem
					logo={false}
					description="Close tabs to the right"
					onClick={() => closeTabs('right')}
					disabled={!canCloseTabsRight()}
				/>
				<FileMenuItem
					logo={false}
					description="Close other tabs"
					onClick={() => closeTabs('other')}
					disabled={!canCloseTabsOther()}
				/>
				<FileMenuItem
					logo={false}
					description="Reopen closed tab"
					shortcutHint={shortcutHint(`Ctrl+Alt+Shift+T`)}
					onClick={reopenClosedTab}
					disabled={Object.keys(closedTabs).length == 0}
				/>
			</ControlledMenu>
		</div>
	);
};

export default Tab;
