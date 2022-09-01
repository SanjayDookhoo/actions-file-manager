import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAction } from '../../ContextActions';
import { buttonStyle } from '../utils/constants';
import { initialTabState, tabMinWidth, tabMaxWidth } from './constants';
import Tab from './Tab';
import { v4 as uuidv4 } from 'uuid';

const Tabs = (props) => {
	const action = useAction();

	const { tabsState, setTabsState, setActiveTabId } = props;
	const tabsContainerRef = useRef(null);
	const scrollableTabsRef = useRef(null);
	const [tabWidth, setTabWidth] = useState(null);
	const [scrollable, setScrollable] = useState(false);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [maxScrollLeft, setMaxScrollLeft] = useState(0);

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
		setTabsState([...tabsState, { ...initialTabState, tabId }]);
		setActiveTabId(tabId);
	};
	const verticalFlyoutMenuProps = {
		...props,
		addNewTab,
	};

	useLayoutEffect(() => {
		action.refreshAction({
			componentName: 'VerticalFlyoutMenu', // necessary to check if the context menu is open or not, this is where it differs from newAction
			Component: <VerticalFlyoutMenu {...verticalFlyoutMenuProps} />, // include any of prop to the "action" that have changed, in this case Component has changed, because it has new props, could even be a change in preferred location
		});
	}, [tabsState]);

	const openVerticalTabFlyout = (event) => {
		action.newAction({
			event,
			componentName: 'VerticalFlyoutMenu',
			Component: <VerticalFlyoutMenu {...verticalFlyoutMenuProps} />,
			relativeTo: 'target',
			location: 'bottom',
			position: 'center',
			padding: 5,
		});
	};

	const unclickableButtonStyle = 'text-gray-100 cursor-auto ';

	useLayoutEffect(() => {
		const tabsContainer = tabsContainerRef.current;
		const handleResizeObserver = () => {
			const width = tabsContainer.offsetWidth;
			const availableWidth = width - 40 * 2; // what is being subtracted is the size of add new tab button and vertical flyout button

			const tempTabWidth = Math.floor(availableWidth / tabsState.length);
			setTabWidth(tempTabWidth);
			setScrollable(tempTabWidth && tempTabWidth < tabMinWidth);
		};
		new ResizeObserver(handleResizeObserver).observe(tabsContainer);
	}, []);

	const tabProps = {
		tabWidth,
		...props,
	};

	return (
		<div ref={tabsContainerRef} className="flex justify-start">
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
				{tabsState.map((tabState) => (
					<Tab key={tabState.tabId} {...tabProps} tabId={tabState.tabId} />
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
			<a
				className=""
				onClick={openVerticalTabFlyout}
				title="Vertical tab flyout"
			>
				<span className={buttonStyle}>expand_more</span>
			</a>
		</div>
	);
};

export default Tabs;

const VerticalFlyoutMenu = (props) => {
	const { tabsState, addNewTab } = props;

	const tabProps = () => {
		const { addNewTab, ...other } = props;
		return other;
	};

	const handleAddNewTabFromContextMenu = (e) => {
		e.stopPropagation(); // this button is used inside a context menu, stop propagation is needed to prevent context menu from closing
		addNewTab();
	};

	return (
		<div className="px-2 bg-gray-100 rounded-lg" style={{ width: tabMaxWidth }}>
			<div className="pt-4">Open tabs</div>
			{tabsState.map((tabState) => (
				<Tab
					key={tabState.tabId}
					{...tabProps()}
					tabId={tabState.tabId}
					inContextMenu={true}
				/>
			))}
			<div className="">
				<a
					className="w-full flex justify-center items-center bg-gray-300 rounded-lg"
					onClick={handleAddNewTabFromContextMenu}
					title="New tab (Ctrl+T)"
				>
					<span className={buttonStyle + 'm-0'}>add</span>
					New Tab
				</a>
			</div>
		</div>
	);
};
