import { useContext } from 'react';
import { FileManagerContext } from '../../../../../FileManager';
import Rename from './Rename';
import RenderIcon from './RenderIcon';

const TilesLayout = (props) => {
	const { record, renderType, renderSize } = props;

	const { fileExtensionsMap, renderName } = useContext(FileManagerContext);

	return (
		<>
			<div className={'flex items-center rounded-sm p-1 '}>
				<RenderIcon
					className="w-16 h-16 object-contain"
					{...{ record, fileExtensionsMap }}
				/>
				<div className="pl-2 w-32 h-16 flex flex-col justify-center">
					{record.__typename === 'folder' ? (
						<div
							className="text-ellipsis overflow-hidden ellipsis-3-line"
							style={{ lineHeight: '21px' }}
						>
							<Rename record={record} renderName={renderName} />
						</div>
					) : (
						<>
							<div
								className="text-ellipsis overflow-hidden whitespace-nowrap"
								style={{ lineHeight: '21px' }}
							>
								<Rename record={record} renderName={renderName} />
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
