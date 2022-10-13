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
import { Menu, MenuItem, FocusableItem } from '@szhsin/react-menu';
import { FileExplorerContext } from '../FileExplorer';
import { isMacOs, shortcutHintGenerate } from '../utils/utils';

const VerticalFlyoutMenu = (props) => {
	const { addNewTab, closeTab } = props;
	const { tabsState } = useContext(FileExplorerContext);

	const handleAddNewTabFromContextMenu = (e) => {
		e.stopPropagation(); // this button is used inside a context menu, stop propagation is needed to prevent context menu from closing
		addNewTab();
	};

	return (
		<Menu
			menuButton={
				<a className="hover" title="Vertical tab flyout">
					<span className={buttonStyle}>expand_more</span>
				</a>
			}
		>
			<div className="" style={{ width: tabMaxWidth }}>
				<div className="pb-2">Open tabs</div>
				{Object.keys(tabsState).map((tabId) => (
					<Tab
						key={tabId}
						tabId={tabId}
						closeTab={closeTab}
						inContextMenu={true}
					/>
				))}
				<div className="">
					<a
						className="w-full flex justify-center items-center rounded-lg bg-shade-1 hover"
						onClick={handleAddNewTabFromContextMenu}
						title={`New tab${shortcutHintGenerate(' (Ctrl+Alt+T)')}`}
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
