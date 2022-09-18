import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../../../../../FileExplorer';
import RenderIcon from './RenderIcon';

const IconsLayout = (props) => {
	const {
		record,
		fileExtensionsMap,
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
	} = useContext(FileExplorerContext);

	const { layout } = localStorage;

	return (
		<>
			<div
				className={
					'flex items-center ' +
					(recordIsSelected(record) ? 'bg-zinc-500 ' : ' ') +
					(!layout.includes('small') ? 'flex-col' : '')
				}
				onClick={(e) => handleSelectFileFolderOnClick(e, record)}
				onDoubleClick={
					record.__typename == 'Folder'
						? () => updateCurrentFolderId(record.id)
						: () => {}
				}
			>
				{layout == 'smallIcons' && (
					<>
						<RenderIcon
							className="w-4 h-4"
							{...{ record, fileExtensionsMap }}
						/>
						<div className="w-32">
							<div
								className="text-ellipsis overflow-hidden whitespace-nowrap"
								style={{ lineHeight: '21px' }}
							>
								{renderName(record)}
							</div>
						</div>
					</>
				)}

				{layout == 'mediumIcons' && (
					<>
						<RenderIcon
							className="w-16 h-16"
							{...{ record, fileExtensionsMap }}
						/>
						<div className="w-32">
							<div
								className="text-ellipsis overflow-hidden ellipsis-3-line text-center"
								style={{ lineHeight: '21px' }}
							>
								{renderName(record)}
							</div>
						</div>
					</>
				)}

				{layout == 'largeIcons' && (
					<>
						<RenderIcon
							className="w-32 h-32"
							{...{ record, fileExtensionsMap }}
						/>
						<div className="w-32">
							<div
								className="text-ellipsis overflow-hidden ellipsis-4-line text-center"
								style={{ lineHeight: '21px' }}
							>
								{renderName(record)}
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default IconsLayout;
