import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { buttonStyle } from '../utils/constants';
import { initialTabState, tabMinWidth, tabMaxWidth } from './constants';
import Tab from './Tab/Tab';
import { Menu, MenuItem, FocusableItem } from '@szhsin/react-menu';

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
		<Menu
			menuButton={
				<a className="" title="Vertical tab flyout">
					<span className={buttonStyle}>expand_more</span>
				</a>
			}
		>
			<div className="" style={{ width: tabMaxWidth }}>
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
		</Menu>
	);
};

export default VerticalFlyoutMenu;