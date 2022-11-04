import { useContext, useEffect, useState } from 'react';
import { FileManagerContext } from '../../../../../FileManager';
import { imageTypes, videoTypes } from '../../../../../utils/constants';
import { getAssets } from '../../../../../utils/utils';

const RenderIcon = ({ record, className, style }) => {
	const { fileExtensionsMap, localStorage, axiosClientJSON } =
		useContext(FileManagerContext);
	const [src, setSrc] = useState({});
	const defaultFile = getAssets('defaultFile.webp'); //svg

	const ext = (record.name ?? '').split('.').pop();
	let iconURL = fileExtensionsMap?.[ext]?.icons.normal;

	useEffect(() => {
		const { id, __typename } = record;
		if (__typename === 'file') {
			axiosClientJSON({
				url: '/downloadFile',
				method: 'POST',
				data: {
					id,
				},
			}).then((res) => {
				setSrc(res.data);
			});
		}
	}, []);

	return (
		<>
			{record.__typename === 'folder' ? (
				<img
					src={getAssets('folder.svg')}
					className={className}
					style={style}
				/>
			) : (
				<>
					{['details', 'smallIcons'].includes(localStorage.layout) ||
					(!videoTypes.includes(ext) && !imageTypes.includes(ext)) ? (
						<img
							className={className}
							style={style}
							src={iconURL ? iconURL : defaultFile}
							onError={({ currentTarget }) => {
								currentTarget.onerror = null; // prevents looping
								currentTarget.src = defaultFile;
							}}
						/>
					) : (
						<>
							{videoTypes.includes(ext) && (
								<video
									className={className}
									style={style}
									preload="metadata"
									src={src.URL}
									type={`video/${ext}`}
								/>
							)}
							{imageTypes.includes(ext) && (
								<img
									className={className}
									style={style}
									src={src.thumbnailURL}
									onError={({ currentTarget }) => {
										currentTarget.onerror = null; // prevents looping
										currentTarget.src = defaultFile;
									}}
								/>
							)}
						</>
					)}
				</>
			)}
		</>
	);
};

export default RenderIcon;
