import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../../../../../FileExplorer';
import Rename from './Rename';
import RenderIcon from './RenderIcon';

const IconsLayout = (props) => {
	const {
		record,
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

	const { layout } = localStorage;

	return (
		<>
			<div
				className={
					'flex items-center ' +
					(recordIsSelected(record) ? 'bg-zinc-500 ' : ' ') +
					(!layout.includes('small') ? 'flex-col' : '')
				}
			>
				{layout == 'smallIcons' && (
					<>
						<RenderIcon
							className="w-4 h-4 object-contain"
							{...{ record, fileExtensionsMap }}
						/>
						<div className="w-32 pl-2">
							<div
								className="text-ellipsis overflow-hidden whitespace-nowrap"
								style={{ lineHeight: '21px' }}
							>
								<Rename record={record} renderName={renderName} />
							</div>
						</div>
					</>
				)}

				{layout == 'mediumIcons' && (
					<>
						<RenderIcon
							className="w-16 h-16 object-contain"
							{...{ record, fileExtensionsMap }}
						/>
						<div className="w-32 pl-2">
							<div
								className="text-ellipsis overflow-hidden ellipsis-3-line text-center"
								style={{ lineHeight: '21px' }}
							>
								<Rename record={record} renderName={renderName} />
							</div>
						</div>
					</>
				)}

				{layout == 'largeIcons' && (
					<>
						<RenderIcon
							className="w-32 h-32 object-contain"
							{...{ record, fileExtensionsMap }}
						/>
						<div className="w-32 pl-2">
							<div
								className="text-ellipsis overflow-hidden ellipsis-4-line text-center"
								style={{ lineHeight: '21px' }}
							>
								<Rename record={record} renderName={renderName} />
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default IconsLayout;
