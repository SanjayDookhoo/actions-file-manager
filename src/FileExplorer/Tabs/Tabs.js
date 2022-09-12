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

const Tabs = () => {
	const { tabsState, setTabsState, setActiveTabId } =
		useContext(FileExplorerContext);
	const tabsContainerRef = useRef(null);
	const scrollableTabsRef = useRef(null);
	const [tabWidth, setTabWidth] = useState(null);
	const [scrollable, setScrollable] = useState(false);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [maxScrollLeft, setMaxScrollLeft] = useState(0);

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

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
	const addNewTab = (e) => {
		const tabId = uuidv4();
		setTabsState({ ...tabsState, [tabId]: initialTabState });
		setActiveTabId(tabId);
	};
	const verticalFlyoutMenuProps = {
		addNewTab,
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
		new ResizeObserver(handleResizeObserver).observe(tabsContainer);
	}, []);

	const handleOnContextMenu = (e) => {
		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	const tabProps = {
		tabWidth,
		addNewTab,
	};

	return (
		<div
			ref={tabsContainerRef}
			className="flex justify-start"
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
			<div
				ref={scrollableTabsRef}
				className="flex overflow-x-auto scrollable-tabs"
			>
				{Object.keys(tabsState).map((tabId) => (
					<Tab key={tabId} {...tabProps} tabId={tabId} />
				))}
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
			<a className="" onClick={addNewTab} title="New tab (Ctrl+T)">
				<span className={buttonStyle}>add</span>
			</a>
			<VerticalFlyoutMenu {...verticalFlyoutMenuProps} />

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<FileMenuItem logo="folder" description="New Tab" onClick={addNewTab} />
				<FileMenuItem logo={false} description="Reopen closed tab" />
			</ControlledMenu>
		</div>
	);
};

export default Tabs;
