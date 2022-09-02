import { useEffect, useState } from 'react';
import DirectoryTable from './DirectoryTable/DirectoryTable';
import DirectoryViewOptions from './DirectoryViewOptions/DirectoryViewOptions';
import Footer from './Footer/Footer';
import PreviewPane from './PreviewPane/PreviewPane';

const DirectoryView = () => {
	return (
		<div className="flex-grow h-full flex flex-col">
			<DirectoryViewOptions />
			<div className="w-full flex justify-between flex-grow">
				<DirectoryTable />
				<PreviewPane />
			</div>
			<Footer />
		</div>
	);
};

export default DirectoryView;
