import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { FileManagerContext } from '../../FileManager';
import FolderPathItem from './FolderPathItem';

const FolderPath = () => {
	const { tabsState, activeTabId } = useContext(FileManagerContext);
	const ref = useRef();

	useLayoutEffect(() => {
		setTimeout(() => {
			const maxScrollLeft = ref.current.scrollWidth - ref.current.clientWidth;
			ref.current.scrollLeft = maxScrollLeft;
		}, 200);
	}, [tabsState, activeTabId]);

	return (
		<div
			ref={ref}
			className="scrollable-folderpath flex grow align-center min-w-0 overflow-x-auto"
		>
			{tabsState[activeTabId]?.path.map((folderId, i) => (
				<FolderPathItem key={folderId} folderId={folderId} i={i} />
			))}
		</div>
	);
};

export default FolderPath;
