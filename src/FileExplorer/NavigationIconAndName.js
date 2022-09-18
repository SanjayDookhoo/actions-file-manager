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
		<div className="flex">
			<img src={src} className="w-6 h-6 mx-2" />
			<div
				className="inline text-ellipsis overflow-hidden select-none"
				style={{ height: '25px' }} // manually set so the folder name doesnt break up into multi line words. also spaced well with icons
			>
				<FolderName folderId={folderId} />
			</div>
		</div>
	);
};

export default NavigationIconAndName;
