import { useEffect, useState } from 'react';
import { buttonStyle } from '../../utils/constants';
import { tabMaxWidth, tabMinWidth } from '../constants';

const icon = 'folder';
const folderName = 'folder name';

const Tab = (props) => {
	const {
		tabWidth,
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		tabId,
		inContextMenu,
	} = props;
	const [width, setWidth] = useState(tabMaxWidth);

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
		// if (inContextMenu) {
		e.stopPropagation(); // used in context menu
		// }
		let tempTabsState = [...tabsState];
		const index = tempTabsState.findIndex((tab) => tab.tabId == tabId);
		tempTabsState = tempTabsState.filter((tab) => tab.tabId != tabId);
		setTabsState(tempTabsState);
		if (activeTabId == tabId) {
			setActiveTabId(tempTabsState[index - 1].tabId);
		}
	};

	const handleOnClick = () => {
		setActiveTabId(tabId);
	};

	return (
		<div
			className={inContextMenu ? 'tab pb-1' : 'tab pr-1 pt-1'}
			style={{ width }}
			onClick={handleOnClick}
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
					<p
						className="inline text-ellipsis overflow-hidden select-none"
						style={{ height: '25px' }} // manually set so the folder name doesnt break up into multi line words. also spaced well with icons
					>
						{folderName}
					</p>
				</div>
				{tabsState.length != 1 && (
					<a className="" onClick={handleClose}>
						<span className={buttonStyle}>close</span>
					</a>
				)}
			</div>
		</div>
	);
};

export default Tab;
