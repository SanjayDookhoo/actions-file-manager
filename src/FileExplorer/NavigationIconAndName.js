import { useEffect, useState } from 'react';
import folder from './assets/folder.svg';
import home from './assets/home.svg';
import star from './assets/star.svg';
import share from './assets/share.svg';
import trash from './assets/trash.svg';
import FolderName from './FolderName';

const NavigationIconAndName = ({ folderId }) => {
	const [src, setSrc] = useState();

	useEffect(() => {
		if (folderId == 'Home') setSrc(home);
		else if (folderId == 'Favorites') setSrc(star);
		else if (folderId == 'Shared with me') setSrc(share);
		else if (folderId == 'Recycle bin') setSrc(trash);
		else setSrc(folder);
	}, [folderId]);

	return (
		<div className="flex w-full">
			<img src={src} className="w-6 h-6 mx-2" />
			<FolderName folderId={folderId} />
		</div>
	);
};

export default NavigationIconAndName;
