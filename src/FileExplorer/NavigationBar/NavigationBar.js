import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../FileExplorer';
import { buttonStyle } from '../utils/constants';
import { update } from '../utils/utils';
import FolderPath from './FolderPath/FolderPath';
import Search from './Search/Search';

const NavigationBar = () => {
	const { tabsState, setTabsState, activeTabId } =
		useContext(FileExplorerContext);

	const handleForwardBack = (num) => {
		const { paths, currentIndex } = tabsState[activeTabId].history;
		const index = currentIndex + num;
		let path = paths[index];
		console.log(path);
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					// adding path in a way that allows keeping track of history
					path: { $set: path },
					history: {
						currentIndex: { $set: index },
					},
					// clearing other selected files and folders
					selectedFolders: {
						$set: [],
					},
					selectedFiles: {
						$set: [],
					},
				},
			})
		);
	};

	const disabledBack = () => {
		const { paths, currentIndex } = tabsState[activeTabId].history;
		return currentIndex == 0;
	};

	const disabledForward = () => {
		const { paths, currentIndex } = tabsState[activeTabId].history;
		return currentIndex == paths.length - 1;
	};

	const disabledClasses = 'text-gray-600 pointer-events-none';

	return (
		<div className="flex items-center justify-start bg-zinc-800">
			<a>
				<span
					className={buttonStyle + (disabledBack() ? disabledClasses : '')}
					onClick={() => handleForwardBack(-1)}
				>
					west
				</span>
			</a>
			<a>
				<span
					className={buttonStyle + (disabledForward() ? disabledClasses : '')}
					onClick={() => handleForwardBack(1)}
				>
					east
				</span>
			</a>
			{/* <a>
				<span className={buttonStyle} onClick={handleUp}>
					north
				</span>
			</a> */}
			{/* <a>
				<span className={buttonStyle}>refresh</span>
			</a> */}
			<FolderPath />
			<Search />
			<a>
				<span className={buttonStyle}>settings</span>
			</a>
		</div>
	);
};

export default NavigationBar;
