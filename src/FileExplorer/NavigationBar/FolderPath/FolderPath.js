import { ControlledMenu, useMenuState } from '@szhsin/react-menu';
import { useContext, useState } from 'react';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { FileExplorerContext } from '../../FileExplorer';
import FolderName from '../../FolderName';
import { update } from '../../utils/utils';
import FolderPathItem from './FolderPathItem';

const FolderPath = () => {
	const { tabsState, setTabsState, activeTabId, setActiveTabId } =
		useContext(FileExplorerContext);

	return (
		<div className="flex grow align-center">
			{tabsState[activeTabId]?.path.map((folderId, i) => (
				<FolderPathItem key={folderId} folderId={folderId} i={i} />
			))}
		</div>
	);
};

export default FolderPath;
