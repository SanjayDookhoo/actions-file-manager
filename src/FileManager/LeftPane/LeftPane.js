import { useContext, useEffect, useState } from 'react';
import AvailableSpace from './AvailableSpace';
import { FileManagerContext } from '../FileManager';
import { openInNewTab, rootNavigationArray, update } from '../utils/utils';
import LeftPaneButton from './LeftPaneButton';

const LeftPane = () => {
	const { tabsState, setTabsState, activeTabId, breakpointClass } =
		useContext(FileManagerContext);

	// const [favoritesIsOpen, setFavoritesIsOpen] = useState(true);
	// const [favorites, setFavorites] = useState(['a', 'b']);

	const handleOnClick = (rootNavigation) => {
		const newPath = [rootNavigation];
		if (
			// clicked the same item that is the current path
			JSON.stringify(newPath) != JSON.stringify(tabsState[activeTabId].path)
		) {
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						// adding path in a way that allows keeping track of history
						path: { $set: newPath },
						history: {
							paths: { $push: [newPath] },
							currentIndex: { $apply: (val) => val + 1 },
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
		}
	};

	const leftPaneButtonProps = {
		handleOnClick,
	};

	return (
		<div className="flex flex-col justify-between">
			<div
				className={
					'flex flex-col items-start shrink-0 p-1 ' +
					breakpointClass({
						md: 'w-52',
						default: 'w-12',
					})
				}
			>
				{rootNavigationArray.map((title) => (
					<LeftPaneButton key={title} title={title} {...leftPaneButtonProps} />
				))}
			</div>
			<div className="">
				<AvailableSpace />
			</div>
		</div>
	);
};

export default LeftPane;
