import { useContext } from 'react';
import { buttonStyle } from '../utils/constants';
import { tabMaxWidth } from './constants';
import Tab from './Tab/Tab';
import { Menu } from '@szhsin/react-menu';
import { FileManagerContext } from '../FileManager';
import { shortcutHintGenerate } from '../utils/utils';

const VerticalFlyoutMenu = (props) => {
	const { addNewTab, closeTab } = props;
	const { tabsState } = useContext(FileManagerContext);

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
				<div className="overflow-auto" style={{ maxHeight: '400px' }}>
					{Object.keys(tabsState).map((tabId) => (
						<Tab
							key={tabId}
							tabId={tabId}
							closeTab={closeTab}
							inContextMenu={true}
						/>
					))}
				</div>
				<div className="">
					<a
						className="w-full flex justify-center items-center rounded-lg hover"
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
