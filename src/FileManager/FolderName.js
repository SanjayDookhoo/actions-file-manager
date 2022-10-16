import { useEffect, useState } from 'react';
import { axiosClientJSON } from './endpoint';

const FolderName = ({ folderId }) => {
	const [name, setName] = useState('');

	useEffect(() => {
		if (Number.isInteger(folderId)) {
			axiosClientJSON({
				url: '/getFolderName',
				method: 'POST',
				data: {
					id: folderId,
				},
			}).then((res) => {
				setName(res.data.name);
			});
		} else {
			setName(folderId);
		}
	}, [folderId]);

	return (
		<div
			className="text-ellipsis whitespace-nowrap overflow-hidden select-none"
			style={{ height: '25px' }} // manually set so the folder name doesnt break up into multi line words. also spaced well with icons
		>
			{Number.isInteger(folderId) ? <>{name}</> : folderId}
		</div>
	);
};

export default FolderName;
