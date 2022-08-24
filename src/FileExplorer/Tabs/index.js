import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { tab_min_width } from './constants';
import Tab from './Tab';

const amt_of_tabs = 3;

const Tabs = () => {
	const tabs_container_ref = useRef(null);
	const scrollable_tabs_ref = useRef(null);
	const [tab_width, setTabWidth] = useState(null);
	const [scrollable, setScrollable] = useState(false);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [scrollWidth, setScrollWidth] = useState(0);
	const [clientWidth, setClientWidth] = useState(0);

	useLayoutEffect(() => {
		const element = scrollable_tabs_ref.current;

		const handleScroll = (e) => {
			setScrollLeft(element.scrollLeft);
		};
		const handleResize = (e) => {
			setScrollWidth(element.scrollWidth);
			setClientWidth(element.clientWidth);
		};

		element.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleResize);

		return () => {
			element.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	useEffect(() => {
		// set initial
		const element = scrollable_tabs_ref.current;
		setScrollWidth(element.scrollWidth);
		setClientWidth(element.clientWidth);
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
			const max_scrollLeft = element.scrollWidth - element.clientWidth;
			if (possible_new_scrollLeft > max_scrollLeft) {
				element.scrollLeft = max_scrollLeft;
			} else {
				element.scrollLeft = possible_new_scrollLeft;
			}
		}
	};
	const addNewTab = () => {};

	const openVerticalTabFlyout = () => {};

	const button_style =
		'material-symbols-outlined p-1 m-1 rounded-lg bg-gray-300 cursor-pointer ';
	const unclickable_button_style = 'text-gray-100 ';

	useLayoutEffect(() => {
		const tabs_container = tabs_container_ref.current;
		const handleResizeObserver = () => {
			const width = tabs_container.offsetWidth;
			const available_width = width - 40 * 2; // what is being subtracted is the size of add new tab button and vertical flyout button

			const temp_tab_width = Math.floor(available_width / amt_of_tabs);
			setTabWidth(temp_tab_width);
			setScrollable(temp_tab_width && temp_tab_width < tab_min_width);
		};
		new ResizeObserver(handleResizeObserver).observe(tabs_container);
	}, []);

	const tab_props = {
		tab_width,
	};

	return (
		<div ref={tabs_container_ref} className="flex justify-start">
			{scrollable && (
				<a
					className={scrollLeft == 0 ? unclickable_button_style : ''}
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
				<Tab {...tab_props} />
				<Tab {...tab_props} />
				<Tab {...tab_props} />
			</div>
			{scrollable && (
				<a
					className={
						scrollLeft == scrollWidth - clientWidth
							? unclickable_button_style
							: ''
					}
					onClick={() => scrollTabs('forward')}
					title="Scoll tab list forward"
				>
					<span className={button_style}>chevron_right</span>
				</a>
			)}
			<a className="" onClick={addNewTab} title="New tab (Ctrl+T)">
				<span className={button_style}>add</span>
			</a>
			<a
				className=""
				onClick={openVerticalTabFlyout}
				title="Vertical tab flyout"
			>
				<span className={button_style}>expand_more</span>
			</a>
		</div>
	);
};

export default Tabs;
