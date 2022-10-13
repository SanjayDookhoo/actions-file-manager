import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../../../../../FileExplorer';
import Rename from './Rename';
import RenderIcon from './RenderIcon';

const DetailsLayout = (props) => {
	const { record, renderDate, renderType, renderSize, recordIsSelected } =
		props;

	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		fileExtensionsMap,
		renderName,
	} = useContext(FileExplorerContext);

	const { detailsLayoutMeta } = localStorage;

	const columnDetails = (key) => {
		if (key == 'name') {
			// return renderName(record);
			return <Rename record={record} renderName={renderName} />;
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
			<div className={'flex items-center rounded-sm p-1 '}>
				<RenderIcon
					className="w-6 h-6 object-contain"
					{...{ record, fileExtensionsMap }}
				/>
				{Object.entries(detailsLayoutMeta)
					.filter(([key, meta]) => meta.visible)
					.sort((_a, _b) => {
						const a = _a[1].order;
						const b = _b[1].order;
						return a - b;
					})
					.map(([key, meta]) => (
						<div
							key={key}
							className="text-ellipsis overflow-hidden whitespace-nowrap px-2 m-0.5" // m-0.5 accounts for the drag bar to resize
							style={{ width: meta.width }}
						>
							{columnDetails(key)}
						</div>
					))}
			</div>
		</>
	);
};

export default DetailsLayout;
