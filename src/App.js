import { createContext, useState } from 'react';
import FileExplorer from './FileExplorer/FileExplorer';

const App = (props) => {
	return (
		<div className="App text-white">
			<FileExplorer {...props} />
		</div>
	);
};

export default App;
