import { useContext, useEffect, useState } from 'react';
import DirectoryLayout from './DirectoryLayout/DirectoryLayout';
import DirectoryViewOptions from './DirectoryViewOptions/DirectoryViewOptions';
import Footer from './Footer/Footer';
import DetailsPane from './DetailsPane/DetailsPane';
import { FileExplorerContext } from '../FileExplorer';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { objectToGraphqlArgs } from 'hasura-args';

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

	const folderSubscriptionGraphql = gql`
		subscription {
			folder(${objectToGraphqlArgs(folderArguments)}) {
				id
				folderName
			}
		}
	`;

	const fileSubscriptionGraphql = gql`
		subscription {
			file(${objectToGraphqlArgs(fileArguments)}) {
				id
				fileName
			}
		}
	`;

	// const { loading, error, data } = useSubscription(folderSubscriptionGraphql);
	const { data: _folders } = useSubscription(folderSubscriptionGraphql);
	const folders = _folders?.folder ?? [];
	const { data: _files } = useSubscription(fileSubscriptionGraphql);
	const files = _files?.file ?? [];

	// useEffect(() => {
	// 	console.log(folders, files);
	// }, [folders, files]);

	const props = {
		setFolderArguments,
		setFileArguments,
		folders,
		files,
	};

	return (
		<div className="flex-grow h-full flex flex-col">
			<DirectoryViewOptions {...props} />
			<div className="w-full flex justify-between flex-grow">
				<DirectoryLayout {...props} />
				{localStorage.showDetailsPane && <DetailsPane />}
			</div>
			<Footer />
		</div>
	);
};

export default DirectoryView;
