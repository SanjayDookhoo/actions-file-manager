import { useEffect, useState } from 'react';
import FolderName from './FolderName';
import { getAssets } from './utils/utils';

const NavigationIconAndName = ({ folderId, className = '' }) => {
	const [src, setSrc] = useState();

	useEffect(() => {
		if (folderId === 'Home') setSrc(getAssets('home.svg'));
		else if (folderId === 'Favorites') setSrc(getAssets('star.svg'));
		else if (folderId === 'Shared with me') setSrc(getAssets('share.svg'));
		else if (folderId === 'Recycle bin') setSrc(getAssets('trash.svg'));
		else setSrc(getAssets('folder.svg'));
	}, [folderId]);

	return (
		<div className={'flex w-full ' + className}>
			<img src={src} className="w-6 h-6 mx-2" />
			<FolderName folderId={folderId} />
		</div>
	);
};

export default NavigationIconAndName;
