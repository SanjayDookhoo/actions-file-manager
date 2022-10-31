import { useContext } from 'react';
import DirectoryLayout from './DirectoryLayout/DirectoryLayout';
import DirectoryViewOptions from './DirectoryViewOptions/DirectoryViewOptions';
import Footer from './Footer/Footer';
import { FileManagerContext } from '../FileManager';

const DirectoryView = () => {
	const { subscriptionLoading } = useContext(FileManagerContext);

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
