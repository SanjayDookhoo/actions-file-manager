import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../../../../../FileExplorer';
import RenderIcon from './RenderIcon';

const DetailsLayout = (props) => {
	const {
		record,
		handleSelectFileFolderOnClick,
		updateCurrentFolderId,
		renderDate,
		renderType,
		renderName,
		renderSize,
		recordIsSelected,
	} = props;

	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		fileExtensionsMap,
	} = useContext(FileExplorerContext);

	const { detailsLayoutMeta } = localStorage;

	const columnDetails = (key) => {
		if (key == 'name') {
			return renderName(record);
		} else if (['created', 'modified', 'lastAccessed'].includes(key)) {
			return renderDate(record, key);
		} else if (key == 'type') {
			return renderType(record);
		} else if (key == 'size') {
			return renderSize(record);
		}
	};

	return (
		<>
			<div
				className={'flex ' + (recordIsSelected(record) ? 'bg-zinc-500 ' : '')}
				onClick={(e) => handleSelectFileFolderOnClick(e, record)}
				onDoubleClick={
					record.__typename == 'Folder'
						? () => updateCurrentFolderId(record.id)
						: () => {}
				}
			>
				<RenderIcon className="w-4 h-4" {...{ record, fileExtensionsMap }} />
				{Object.entries(detailsLayoutMeta)
					.filter(([key, meta]) => meta.visible)
					.sort((_a, _b) => {
						const a = _a[1].order;
						const b = _b[1].order;
						return a - b;
					})
					.map(([key, meta]) => (
						<div key={key} style={{ width: meta.width }}>
							{columnDetails(key)}
						</div>
					))}
			</div>
		</>
	);
};

export default DetailsLayout;
