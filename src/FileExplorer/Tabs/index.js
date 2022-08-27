import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAction } from '../../ContextActions';
import { initial_tab_state, tab_min_width } from './constants';
import Tab from './Tab';

const Test = () => {
	return (
		<div className="bg-red-800" style={{ width: '50px', height: '50px' }}></div>
	);
};

const Tabs = (props) => {
	const action = useAction();

	const { tabs_state, setTabsState } = props;
	const tabs_container_ref = useRef(null);
	const scrollable_tabs_ref = useRef(null);
	const [tab_width, setTabWidth] = useState(null);
	const [scrollable, setScrollable] = useState(false);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [max_scrollLeft, setMaxScrollLeft] = useState(0);

	const getMaxScrollLeft = (element) => {
		return element.scrollWidth - element.clientWidth;
	};

	useLayoutEffect(() => {
		const element = scrollable_tabs_ref.current;

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
		const element = scrollable_tabs_ref.current;
		setMaxScrollLeft(getMaxScrollLeft(element));
	}, [scrollable]);

	const scrollTabs = (direction) => {
		const element = scrollable_tabs_ref.current;

		if (direction == 'backward') {
			const possible_new_scrollLeft = scrollLeft - tab_width;
			if (possible_new_scrollLeft < 0) {
				element.scrollLeft = 0;
			} else {
				element.scrollLeft = possible_new_scrollLeft;
			}
		} else if (direction == 'forward') {
			const possible_new_scrollLeft = scrollLeft + tab_width;
			const max_scrollLeft = getMaxScrollLeft(element);
			if (possible_new_scrollLeft > max_scrollLeft) {
				element.scrollLeft = max_scrollLeft;
			} else {
				element.scrollLeft = possible_new_scrollLeft;
			}
		}
	};
	const addNewTab = () => {
		setTabsState([
			...tabs_state,
			{ ...initial_tab_state, tab_number: tabs_state.length },
		]);
	};

	useLayoutEffect(() => {
		action.refreshAction({ componentName: 'Test' });
	}, [tabs_state]);

	const openVerticalTabFlyout = (event) => {
		// action.newAction({
		// 	event,
		// 	componentName: 'Test',
		// 	Component: <Test />,
		// 	relativeTo: 'mouse',
		// 	yAxis: 'center',
		// 	xAxis: 'center',
		// });
		action.newAction({
			event,
			componentName: 'Test',
			Component: <Test />,
			relativeTo: 'target',
			location: 'left',
			position: 'end',
			padding: 5,
		});
	};

	const button_style =
		'material-symbols-outlined p-1 m-1 rounded-lg bg-gray-300 ';
	const unclickable_button_style = 'text-gray-100 ';

	useLayoutEffect(() => {
		const tabs_container = tabs_container_ref.current;
		const handleResizeObserver = () => {
			const width = tabs_container.offsetWidth;
			const available_width = width - 40 * 2; // what is being subtracted is the size of add new tab button and vertical flyout button

			const temp_tab_width = Math.floor(available_width / tabs_state.length);
			setTabWidth(temp_tab_width);
			setScrollable(temp_tab_width && temp_tab_width < tab_min_width);
		};
		new ResizeObserver(handleResizeObserver).observe(tabs_container);
	}, []);

	const tab_props = {
		tab_width,
		...props,
	};

	return (
		<div ref={tabs_container_ref} className="flex justify-start">
			{scrollable && (
				<a
					className={
						scrollLeft == 0 ? unclickable_button_style : 'cursor-pointer'
					}
					onClick={() => scrollTabs('backward')}
					title="Scoll tab list backward"
				>
					<span className={button_style}>chevron_left</span>
				</a>
			)}
			<div
				ref={scrollable_tabs_ref}
				className="flex overflow-x-auto scrollable-tabs"
			>
				{tabs_state.map((tab_state, tab_index) => (
					<Tab key={tab_index} {...tab_props} tab_index={tab_index} />
				))}
			</div>
			{scrollable && (
				<a
					className={
						scrollLeft == max_scrollLeft
							? unclickable_button_style
							: 'cursor-pointer'
					}
					onClick={() => scrollTabs('forward')}
					title="Scoll tab list forward"
				>
					<span className={button_style}>chevron_right</span>
				</a>
			)}
			<a
				className="cursor-pointer"
				onClick={addNewTab}
				title="New tab (Ctrl+T)"
			>
				<span className={button_style}>add</span>
			</a>
			<a
				className="cursor-pointer"
				onClick={openVerticalTabFlyout}
				title="Vertical tab flyout"
			>
				<span className={button_style}>expand_more</span>
			</a>
		</div>
	);
};

export default Tabs;
