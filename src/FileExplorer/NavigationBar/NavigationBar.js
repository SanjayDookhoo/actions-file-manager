import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../FileExplorer';
import { buttonStyle } from '../utils/constants';
import { shortcutHotkeyGenerate, update } from '../utils/utils';
import FolderPath from './FolderPath/FolderPath';
import Search from './Search/Search';
import { useHotkeys } from 'react-hotkeys-hook';

const NavigationBar = () => {
	const { tabsState, setTabsState, activeTabId } =
		useContext(FileExplorerContext);

	const handleForwardBack = (num) => {
		if (num == -1 && disabledBack()) return;
		if (num == 1 && disabledForward()) return;
		const { paths, currentIndex } = tabsState[activeTabId].history;
		const index = currentIndex + num;
		let path = paths[index];
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

	useHotkeys(
		shortcutHotkeyGenerate('backspace'),
		() => handleForwardBack(-1),
		{ enabled: !disabledBack() },
		[tabsState, activeTabId]
	);

	const disabledClasses = 'text-gray-600 cursor-default';

	return (
		<div className="flex items-center justify-start bg-zinc-800">
			<a
				className={buttonStyle + (disabledBack() ? disabledClasses : '')}
				onClick={() => handleForwardBack(-1)}
			>
				<span>west</span>
			</a>
			<a
				className={buttonStyle + (disabledForward() ? disabledClasses : '')}
				onClick={() => handleForwardBack(1)}
			>
				<span>east</span>
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
			{/* <a>
				<span className={buttonStyle}>settings</span>
			</a> */}
		</div>
	);
};

export default NavigationBar;
