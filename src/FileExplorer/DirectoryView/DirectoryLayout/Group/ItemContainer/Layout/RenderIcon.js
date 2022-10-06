import { useContext, useEffect, useState } from 'react';
import defaultFile from '../../../../../assets/defaultFile.webp';
import folder from '../../../../../assets/folder.svg';
import { axiosClientJSON } from '../../../../../endpoint';
import { FileExplorerContext } from '../../../../../FileExplorer';
import { imageTypes, videoTypes } from '../../../../../utils/constants';

const RenderIcon = ({ record, className, style }) => {
	const { fileExtensionsMap, localStorage } = useContext(FileExplorerContext);
	const [src, setSrc] = useState({});

	const ext = (record.name ?? '').split('.').pop();
	console.log(ext);
	let iconURL = fileExtensionsMap?.[ext]?.icons.normal;

	useEffect(() => {
		const { id } = record;
		axiosClientJSON({
			url: '/downloadFile',
			method: 'POST',
			data: {
				id,
			},
		}).then((res) => {
			setSrc(res.data);
		});
	}, []);

	return (
		<div className={className} style={style}>
			{record.__typename == 'folder' ? (
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
		</div>
	);
};

export default RenderIcon;
