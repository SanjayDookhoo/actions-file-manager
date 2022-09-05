import { createContext, useState } from 'react';
import FileExplorer from './FileExplorer/FileExplorer';

const App = () => {
	return (
		<div className="App text-white">
			<FileExplorer />
		</div>
	);
};

export default App;
