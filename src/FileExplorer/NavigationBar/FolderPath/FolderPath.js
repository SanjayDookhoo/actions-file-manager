import { useContext } from 'react';
import { FileExplorerContext } from '../../FileExplorer';
import FolderName from '../../FolderName';
import { update } from '../../utils/utils';

const FolderPath = () => {
	const { tabsState, setTabsState, activeTabId } =
		useContext(FileExplorerContext);

	const handleFolderPathOnClick = (e, folderId) => {
		if (folderId == [...tabsState[activeTabId].path].reverse()[0]) {
			// if the last path is clicked, just reset the selected folders and files
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
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
		} else {
			const index = tabsState[activeTabId].path.findIndex(
				(el) => el == folderId
			);
			let newPath = [...tabsState[activeTabId].path];
			newPath = newPath.slice(0, index + 1);
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

	return (
		<div className="flex grow align-center">
			{tabsState[activeTabId]?.path.map((folderId, i) => (
				<div
					className="flex align-center"
					key={folderId}
					onClick={(e) => handleFolderPathOnClick(e, folderId)}
				>
					<FolderName folderId={folderId} />
					{i != tabsState[activeTabId]?.path.length - 1 && (
						<span className="material-symbols-outlined">chevron_right</span>
					)}
				</div>
			))}
		</div>
	);
};

export default FolderPath;
