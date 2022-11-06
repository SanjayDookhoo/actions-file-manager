import { useEffect } from 'react';
import useSubscription from './useSubscription';

const GetFilesFolders = ({
	setFiles,
	setFolders,
	setSharedAccessType,
	setSubscriptionLoading,
	folderId,
	setFirstLoad,
}) => {
	const [_files, filesLoading, filesError] = useSubscription(
		folderId,
		'file',
		'itemList'
	);
	const [_folders, foldersLoading, foldersError] = useSubscription(
		folderId,
		'folder',
		'itemList'
	);

	useEffect(() => {
		if (_files) {
			const { data, accessType } = _files;
			setFiles(
				data.file.map((record) => ({
					...record,
					__typename: 'file',
				}))
			);
			setSharedAccessType(accessType);
		}
	}, [_files]);

	useEffect(() => {
		if (_folders) {
			const { data, accessType } = _folders;
			setFolders(
				data.folder.map((record) => ({
					...record,
					__typename: 'folder',
				}))
			);
			setSharedAccessType(accessType);
		}
	}, [_folders]);

	useEffect(() => {
		setSubscriptionLoading(filesLoading || foldersLoading);

		if (!(filesLoading || foldersLoading)) {
			setFirstLoad(false);
		}
	}, [filesLoading, foldersLoading]);

	return <></>;
};

export default GetFilesFolders;
