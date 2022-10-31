import { useContext } from 'react';
import { FileManagerContext } from '../../FileManager';
import FolderPathItem from './FolderPathItem';

const FolderPath = () => {
	const { tabsState, activeTabId } = useContext(FileManagerContext);

	return (
		<div className="flex grow align-center min-w-0">
			{tabsState[activeTabId]?.path.map((folderId, i) => (
				<FolderPathItem key={folderId} folderId={folderId} i={i} />
			))}
		</div>
	);
};

export default FolderPath;
