import { useEffect, useState } from 'react';
import DirectoryLayout from './DirectoryLayout/DirectoryLayout';
import DirectoryViewOptions from './DirectoryViewOptions/DirectoryViewOptions';
import Footer from './Footer/Footer';
import PreviewPane from './PreviewPane/PreviewPane';

const DirectoryView = (props) => {
	return (
		<div className="flex-grow h-full flex flex-col">
			<DirectoryViewOptions {...props} />
			<div className="w-full flex justify-between flex-grow">
				<DirectoryLayout {...props} />
				<PreviewPane />
			</div>
			<Footer />
		</div>
	);
};

export default DirectoryView;
