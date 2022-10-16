import { useContext, useEffect, useState } from 'react';
import DirectoryLayout from './DirectoryLayout/DirectoryLayout';
import DirectoryViewOptions from './DirectoryViewOptions/DirectoryViewOptions';
import Footer from './Footer/Footer';
import DetailsPane from './DetailsPane/DetailsPane';
import { FileManagerContext } from '../FileManager';
import { axiosClientFileExtension } from '../endpoint';

const DirectoryView = () => {
	const { localStorage, setLocalStorage, subscriptionLoading } =
		useContext(FileManagerContext);

	return (
		<div className="flex-grow h-full flex flex-col overflow-auto">
			<DirectoryViewOptions />
			<div className="w-full flex justify-between flex-grow basis-0 min-h-0 overflow-auto">
				{!subscriptionLoading && <DirectoryLayout />}
				{/* {localStorage.showDetailsPane && <DetailsPane />} */}
			</div>
			<Footer />
		</div>
	);
};

export default DirectoryView;
