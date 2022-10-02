import {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { buttonStyle } from '../utils/constants';
import { initialTabState, tabMinWidth, tabMaxWidth } from './constants';
import Tab from './Tab/Tab';
import { v4 as uuidv4 } from 'uuid';
import VerticalFlyoutMenu from './VerticalFlyoutMenu';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import FileMenuItem from '../CustomReactMenu/FileMenuItem';
import { FileExplorerContext } from '../FileExplorer';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { isMacOs, shortcutGenerate, shortcutHint } from '../utils/utils';
import { useHotkeys } from 'react-hotkeys-hook';

const Tabs = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		newTabOrder,
		setNewtabOrder,
		closedTabs,
		setClosedTabs,
	} = useContext(FileExplorerContext);
	const tabsContainerRef = useRef(null);
	const scrollableTabsRef = useRef(null);
	const [tabWidth, setTabWidth] = useState(null);
	const [scrollable, setScrollable] = useState(false);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [maxScrollLeft, setMaxScrollLeft] = useState(0);

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

	useHotkeys(shortcutGenerate('ctrl+alt+t'), () => addNewTab(), {}, [
		tabsState,
		newTabOrder,
	]);
	useHotkeys(
		shortcutGenerate('ctrl+alt+w'),
		() => closeTab(activeTabId),
		{
			enabled: Object.keys(tabsState).length != 1,
		},
		[tabsState, closedTabs, activeTabId]
	);
	useHotkeys(
		shortcutGenerate('ctrl+alt+shift+t'),
		() => reopenClosedTab(),
		{
			enabled: Object.keys(closedTabs).length != 0,
		},
		[tabsState, closedTabs, newTabOrder]
	);

	const closeTab = (tabId) => {
		setClosedTabs({ [tabId]: tabsState[tabId], ...closedTabs });
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

	const getMaxScrollLeft = (element) => {
		return element.scrollWidth - element.clientWidth;
	};

	useLayoutEffect(() => {
		const element = scrollableTabsRef.current;

		const handleScroll = (e) => {
			setScrollLeft(element.scrollLeft);
		};
		const handleResize = (e) => {
			setMaxScrollLeft(getMaxScrollLeft(element));
		};

		element.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleResize);

		return () => {
			element.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	useLayoutEffect(() => {
		// set initial
		const element = scrollableTabsRef.current;
		setMaxScrollLeft(getMaxScrollLeft(element));
	}, [scrollable]);

	const scrollTabs = (direction) => {
		const element = scrollableTabsRef.current;

		if (direction == 'backward') {
			const possibleNewScrollLeft = scrollLeft - tabWidth;
			if (possibleNewScrollLeft < 0) {
				element.scrollLeft = 0;
			} else {
				element.scrollLeft = possibleNewScrollLeft;
			}
		} else if (direction == 'forward') {
			const possibleNewScrollLeft = scrollLeft + tabWidth;
			const maxScrollLeft = getMaxScrollLeft(element);
			if (possibleNewScrollLeft > maxScrollLeft) {
				element.scrollLeft = maxScrollLeft;
			} else {
				element.scrollLeft = possibleNewScrollLeft;
			}
		}
	};
	const addNewTab = () => {
		console.log(tabsState);
		const tabId = uuidv4();
		setTabsState({
			...tabsState,
			[tabId]: { ...initialTabState, order: newTabOrder },
		});
		setNewtabOrder(newTabOrder + 1);
		setActiveTabId(tabId);
	};

	const reopenClosedTab = () => {
		const [tabId, value] = Object.entries(closedTabs)[0];
		setTabsState({
			...tabsState,
			[tabId]: { ...value, order: newTabOrder },
		});
		setNewtabOrder(newTabOrder + 1);
		setActiveTabId(tabId);

		const tempClosedTabs = { ...closedTabs };
		delete tempClosedTabs[tabId];
		setClosedTabs(tempClosedTabs);
	};

	const verticalFlyoutMenuProps = {
		addNewTab,
		closeTab,
	};

	const unclickableButtonStyle = 'text-gray-100 cursor-auto ';

	useLayoutEffect(() => {
		const tabsContainer = tabsContainerRef.current;
		const handleResizeObserver = () => {
			const width = tabsContainer.offsetWidth;
			const availableWidth = width - 40 * 2; // what is being subtracted is the size of add new tab button and vertical flyout button

			const tempTabWidth = Math.floor(
				availableWidth / Object.keys(tabsState).length
			);
			setTabWidth(tempTabWidth);
			setScrollable(tempTabWidth && tempTabWidth < tabMinWidth);
		};
		const observer = new ResizeObserver(handleResizeObserver);
		observer.observe(tabsContainer);
		return () => {
			observer.unobserve(tabsContainer);
		};
	}, [tabsState]);

	const handleOnContextMenu = (e) => {
		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	const handleOnDragEnd = (result) => {
		if (!result.destination) {
			return;
		}

		const keys = Object.keys(tabsState).sort(
			(a, b) => tabsState[a].order - tabsState[b].order
		);
		const tempTabsState = { ...tabsState };
		const destIndex = result.destination.index;
		const srcIndex = result.source.index;

		if (destIndex > srcIndex) {
			for (let i = srcIndex + 1; i <= destIndex; i++) {
				tempTabsState[keys[i]].order--;
			}
			tempTabsState[keys[srcIndex]].order =
				tempTabsState[keys[destIndex]].order + 1;
		} else if (destIndex < srcIndex) {
			for (let i = destIndex; i < srcIndex; i++) {
				tempTabsState[keys[i]].order++;
			}
			tempTabsState[keys[srcIndex]].order =
				tempTabsState[keys[destIndex]].order - 1;
		}

		setTabsState(tempTabsState);
	};

	const tabProps = {
		tabWidth,
		addNewTab,
		reopenClosedTab,
		closeTab,
	};

	return (
		<div
			ref={tabsContainerRef}
			className="flex justify-start w-full"
			onContextMenu={handleOnContextMenu}
		>
			{scrollable && (
				<a
					className={scrollLeft == 0 ? unclickableButtonStyle : ''}
					onClick={() => scrollTabs('backward')}
					title="Scoll tab list backward"
				>
					<span className={buttonStyle}>chevron_left</span>
				</a>
			)}
			<div className="overflow-hidden" ref={scrollableTabsRef}>
				<DragDropContext onDragEnd={handleOnDragEnd}>
					<Droppable droppableId="droppable" direction="horizontal">
						{(provided, snapshot) => (
							<div
								// ref={scrollableTabsRef}
								ref={provided.innerRef}
								{...provided.droppableProps}
								className="flex overflow-x-auto scrollable-tabs"
							>
								{Object.keys(tabsState)
									.sort((a, b) => tabsState[a].order - tabsState[b].order)
									.map((tabId, index) => (
										// <Tab key={tabId} {...tabProps} tabId={tabId} />
										<Draggable key={tabId} draggableId={tabId} index={index}>
											{(provided, snapshot) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
												>
													<Tab key={tabId} {...tabProps} tabId={tabId} />
												</div>
											)}
										</Draggable>
									))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
			{scrollable && (
				<a
					className={scrollLeft == maxScrollLeft ? unclickableButtonStyle : ''}
					onClick={() => scrollTabs('forward')}
					title="Scoll tab list forward"
				>
					<span className={buttonStyle}>chevron_right</span>
				</a>
			)}
			<a
				className=""
				onClick={addNewTab}
				title={`New tab${shortcutHint(' (Ctrl+Alt+T)')}`}
			>
				<span className={buttonStyle}>add</span>
			</a>
			<VerticalFlyoutMenu {...verticalFlyoutMenuProps} />

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<FileMenuItem
					logo="folder"
					description="New tab"
					shortcutHint={shortcutHint(`Ctrl+Alt+T`)}
					onClick={addNewTab}
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

export default Tabs;
