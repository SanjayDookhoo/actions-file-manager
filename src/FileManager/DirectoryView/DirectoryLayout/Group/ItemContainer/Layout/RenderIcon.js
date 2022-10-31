import { useContext, useEffect, useState } from 'react';
import defaultFile from '../../../../../assets/defaultFile.webp';
import folder from '../../../../../assets/folder.svg';
import { axiosClientJSON } from '../../../../../endpoint';
import { FileManagerContext } from '../../../../../FileManager';
import { imageTypes, videoTypes } from '../../../../../utils/constants';

const RenderIcon = ({ record, className, style }) => {
	const { fileExtensionsMap, localStorage } = useContext(FileManagerContext);
	const [src, setSrc] = useState({});

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
				<img src={folder} className={className} style={style} />
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
