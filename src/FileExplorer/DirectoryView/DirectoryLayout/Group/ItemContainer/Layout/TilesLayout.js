import RenderIcon from './RenderIcon';

const TilesLayout = (props) => {
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

	return (
		<>
			<div
				className={
					'flex items-center ' +
					(recordIsSelected(record) ? 'bg-zinc-500 ' : '')
				}
				onClick={(e) => handleSelectFileFolderOnClick(e, record)}
				onDoubleClick={
					record.__typename == 'Folder'
						? () => updateCurrentFolderId(record.id)
						: () => {}
				}
			>
				<RenderIcon className="w-16 h-16" {...{ record, fileExtensionsMap }} />
				<div className="w-32 h-16 flex flex-col justify-center">
					{record.__typename == 'Folder' ? (
						<div
							className="text-ellipsis overflow-hidden ellipsis-3-line"
							style={{ lineHeight: '21px' }}
						>
							{renderName(record)}
						</div>
					) : (
						<>
							<div
								className="text-ellipsis overflow-hidden whitespace-nowrap"
								style={{ lineHeight: '21px' }}
							>
								{renderName(record)}
							</div>
							<div
								className="text-ellipsis overflow-hidden whitespace-nowrap"
								style={{ lineHeight: '21px' }}
							>
								{renderType(record)}
							</div>
							<div style={{ lineHeight: '21px' }}>{renderSize(record)}</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default TilesLayout;
