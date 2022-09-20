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

	return (
		<div className="flex-grow h-full flex flex-col">
			<DirectoryViewOptions />
			<div className="w-full flex justify-between flex-grow">
				<DirectoryLayout />
				{/* {localStorage.showDetailsPane && <DetailsPane />} */}
			</div>
			<Footer />
		</div>
	);
};

export default DirectoryView;
