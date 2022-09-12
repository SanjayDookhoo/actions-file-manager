import { useContext } from 'react';
import { FileExplorerContext } from '../../FileExplorer';
import FolderName from '../../FolderName';
import { update } from '../../utils/utils';

const FolderPath = () => {
	const { tabsState, setTabsState, activeTabId } =
		useContext(FileExplorerContext);

	const handleFolderPathOnClick = (e, folderId) => {
		const index = tabsState[activeTabId].path.findIndex((el) => el == folderId);
		setTabsState(
			update(tabsState, {
				[activeTabId]: { path: { $apply: (val) => val.slice(0, index + 1) } },
			})
		);
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
