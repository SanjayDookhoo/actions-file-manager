import { ControlledMenu, useMenuState } from '@szhsin/react-menu';
import { useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { FileExplorerContext } from '../../FileExplorer';
import FolderName from '../../FolderName';
import { buttonStyle } from '../../utils/constants';
import { tabMaxWidth, tabMinWidth } from '../constants';

const icon = 'folder';

const Tab = (props) => {
	const { tabWidth, tabId, inContextMenu, addNewTab, reopenClosedTab } = props;
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
		let tempTabsState = { ...tabsState };
		const tempTabsStateKeys = Object.keys(tempTabsState);
		const index = tempTabsStateKeys.findIndex((el) => el == tabId);
		delete tempTabsState[tabId];
		setTabsState(tempTabsState);
		if (activeTabId == tabId) {
			// if the current active tab is the one being closed AND is the last tab
			if (tempTabsStateKeys[tempTabsStateKeys.length - 1] == tabId) {
				setActiveTabId(tempTabsStateKeys[index - 1]);
			} else {
				setActiveTabId(tempTabsStateKeys[index + 1]);
			}
		}
	};

	const handleOnClick = () => {
		setActiveTabId(tabId);
	};

	const duplicateTab = (e) => {
		// e.syntheticEvent.stopPropagation();
		const currTab = tabsState[tabId];
		const { order } = currTab;

		let newTabsState = Object.fromEntries(
			Object.entries(tabsState).map(([key, value]) => {
				return [
					key,
					{
						...value,
						order: value.order > order ? value.order + 1 : value.order,
					},
				];
			})
		);

		const uuid = uuidv4();
		newTabsState[uuid] = {
			...currTab,
			order: currTab.order + 1,
		};
		setActiveTabId(uuid); // TODO: not sure why the active tab isnt changing
		setTabsState(newTabsState);
	};

	const closeTabsLeft = () => {
		const tempTabsState = { ...tabsState };
		const currTab = tempTabsState[tabId];
		const { order } = currTab;
		const extraClosedTabs = {};

		const toDelete = Object.keys(tempTabsState)
			.filter((key) => tempTabsState[key].order < order)
			.sort((a, b) => tempTabsState[a].order - tempTabsState[b].order);

		toDelete.forEach((key) => {
			extraClosedTabs[key] = tempTabsState[key];
			delete tempTabsState[key];
		});

		setClosedTabs({ ...extraClosedTabs, ...closedTabs });
		setTabsState(tempTabsState);
	};

	const closeTabsRight = () => {
		const tempTabsState = { ...tabsState };
		const currTab = tempTabsState[tabId];
		const { order } = currTab;
		const extraClosedTabs = {};

		const toDelete = Object.keys(tempTabsState)
			.filter((key) => tempTabsState[key].order > order)
			.sort((a, b) => tempTabsState[a].order - tempTabsState[b].order);

		toDelete.forEach((key) => {
			extraClosedTabs[key] = tempTabsState[key];
			delete tempTabsState[key];
		});

		setClosedTabs({ ...extraClosedTabs, ...closedTabs });
		setTabsState(tempTabsState);
	};

	const closeTabsOther = () => {
		const tempTabsState = { ...tabsState };
		const currTab = tempTabsState[tabId];
		const { order } = currTab;
		const extraClosedTabs = {};

		let toDelete;
		// left
		toDelete = Object.keys(tempTabsState)
			.filter((key) => tempTabsState[key].order < order)
			.sort((a, b) => tempTabsState[a].order - tempTabsState[b].order);

		toDelete.forEach((key) => {
			extraClosedTabs[key] = tempTabsState[key];
			delete tempTabsState[key];
		});

		// right
		toDelete = Object.keys(tempTabsState)
			.filter((key) => tempTabsState[key].order > order)
			.sort((a, b) => tempTabsState[a].order - tempTabsState[b].order);

		toDelete.forEach((key) => {
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
					<span className={buttonStyle}>{icon}</span>
					<div
						className="inline text-ellipsis overflow-hidden select-none"
						style={{ height: '25px' }} // manually set so the folder name doesnt break up into multi line words. also spaced well with icons
					>
						{/* Because .reverse modifies the originally array, apply it to a copy of the array */}
						<FolderName folderId={[...tabsState[tabId].path].reverse()[0]} />
					</div>
				</div>
				{Object.keys(tabsState).length != 1 && (
					<a className="" onClick={handleClose}>
						<span className={buttonStyle}>close</span>
					</a>
				)}
			</div>

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				portal={controlledMenuPortal}
				onClose={() => toggleMenu(false)}
				onClick={(e) => e.stopPropagation()}
			>
				<FileMenuItem logo="folder" description="New Tab" onClick={addNewTab} />
				<FileMenuItem
					logo="folder"
					description="Duplicate Tab"
					onClick={duplicateTab}
				/>
				<FileMenuItem
					logo={false}
					description="Close tabs to the left"
					onClick={closeTabsLeft}
				/>
				<FileMenuItem
					logo={false}
					description="Close tabs to the right"
					onClick={closeTabsRight}
				/>
				<FileMenuItem
					logo={false}
					description="Close other tabs"
					onClick={closeTabsOther}
				/>
				<FileMenuItem
					logo={false}
					description="Reopen closed tab"
					onClick={reopenClosedTab}
				/>
			</ControlledMenu>
		</div>
	);
};

export default Tab;
