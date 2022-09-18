import defaultFile from '../../../../../assets/defaultFile.webp';
import folder from '../../../../../assets/folder.svg';

const RenderIcon = ({ record, fileExtensionsMap, className, style }) => {
	const ext = (record.name ?? '').split('.').pop();
	let iconURL = fileExtensionsMap?.[ext]?.icons.normal;

	return (
		<div className={className} style={style}>
			{record.__typename == 'Folder' ? (
				<img src={folder} className={className} style={style} />
			) : (
				<img
					className={className}
					style={style}
					src={iconURL ? iconURL : defaultFile}
					onError={({ currentTarget }) => {
						currentTarget.onerror = null; // prevents looping
						currentTarget.src = defaultFile;
					}}
				/>
			)}
		</div>
	);
};

export default RenderIcon;
