import { useContext } from 'react';
import { FileManagerContext } from '../../../../../FileManager';
import Rename from './Rename';
import RenderIcon from './RenderIcon';

const IconsLayout = (props) => {
	const { record } = props;

	const { localStorage, fileExtensionsMap, renderName } =
		useContext(FileManagerContext);

	const { layout } = localStorage;

	return (
		<>
			<div
				className={
					'flex items-center rounded-sm p-1 ' +
					(!layout.includes('small') ? 'flex-col' : '')
				}
			>
				{layout === 'smallIcons' && (
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

				{layout === 'mediumIcons' && (
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

				{layout === 'largeIcons' && (
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
