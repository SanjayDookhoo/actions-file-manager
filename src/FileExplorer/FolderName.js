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
		}
	}, []);

	return <div>{Number.isInteger(folderId) ? <>{name}</> : folderId}</div>;
};

export default FolderName;
