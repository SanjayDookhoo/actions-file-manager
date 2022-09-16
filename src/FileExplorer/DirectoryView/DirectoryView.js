import { useContext, useEffect, useState } from 'react';
import DirectoryLayout from './DirectoryLayout/DirectoryLayout';
import DirectoryViewOptions from './DirectoryViewOptions/DirectoryViewOptions';
import Footer from './Footer/Footer';
import DetailsPane from './DetailsPane/DetailsPane';
import { FileExplorerContext } from '../FileExplorer';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { objectToGraphqlArgs } from 'hasura-args';
import { axiosClientFileExtension } from '../endpoint';

const DirectoryView = () => {
	const { localStorage, setLocalStorage } = useContext(FileExplorerContext);

	const initialFolderArguments = {
		where: { parentFolderId: { _isNull: true } },
	};
	const initialFileArguments = { where: { folderId: { _isNull: true } } };
	const [folderArguments, setFolderArguments] = useState(
		initialFolderArguments
	);
	const [fileArguments, setFileArguments] = useState(initialFileArguments);
	const [fileExtensionsMap, setFileExtensionsMap] = useState({});

	const folderSubscriptionGraphql = gql`
		subscription {
			folder(${objectToGraphqlArgs(folderArguments)}) {
				id
				name
				meta {
					modified
					created
					lastAccessed
				}
			}
		}
	`;

	const fileSubscriptionGraphql = gql`
		subscription {
			file(${objectToGraphqlArgs(fileArguments)}) {
				id
				name
				size
				meta {
					modified
					created
					lastAccessed
				}
			}
		}
	`;

	// const { loading, error, data } = useSubscription(folderSubscriptionGraphql);
	const { data: _folders } = useSubscription(folderSubscriptionGraphql);
	const folders = _folders?.folder ?? [];
	const { data: _files } = useSubscription(fileSubscriptionGraphql);
	const files = _files?.file ?? [];

	useEffect(() => {
		const promises = [];
		const fileExtensions = files
			.filter((file) => file.name.split('.')[0])
			.map((file) => file.name.split('.').pop());
		const fileExtensionsUnique = [...new Set(fileExtensions)];
		const tempFileExtensionsMap = {};

		for (const extension of fileExtensionsUnique) {
			promises.push(
				axiosClientFileExtension({
					url: '/details',
					method: 'GET',
					params: {
						extension,
					},
				})
			);
		}

		// TODO: what if a file type is tried to be gotten and fails?
		Promise.all(promises).then(async (allResponses) => {
			allResponses.forEach((response, i) => {
				if (response.status == 200) {
					tempFileExtensionsMap[fileExtensionsUnique[i]] = response.data;
					setFileExtensionsMap(tempFileExtensionsMap);
				}
			});
		});
	}, [files]);

	// useEffect(() => {
	// 	console.log(folders, files);
	// }, [folders, files]);

	const props = {
		setFolderArguments,
		setFileArguments,
		folders,
		files,
		fileExtensionsMap,
	};

	return (
		<div className="flex-grow h-full flex flex-col">
			<DirectoryViewOptions {...props} />
			<div className="w-full flex justify-between flex-grow">
				<DirectoryLayout {...props} />
				{localStorage.showDetailsPane && <DetailsPane />}
			</div>
			<Footer {...props} />
		</div>
	);
};

export default DirectoryView;
