import { useContext, useEffect, useState } from 'react';
import { FileManagerContext } from '../FileManager';
import { openInNewTab, rootNavigationArray, update } from '../utils/utils';
import LeftPaneButton from './LeftPaneButton';

const LeftPane = () => {
	const { tabsState, setTabsState, activeTabId } =
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
		<div className="flex flex-col items-start shrink-0 p-1 w-12 md:w-52">
			{rootNavigationArray.map((title) => (
				<LeftPaneButton key={title} title={title} {...leftPaneButtonProps} />
			))}
		</div>
	);
};

export default LeftPane;
