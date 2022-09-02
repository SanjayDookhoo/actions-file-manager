import { createContext, useState } from 'react';
import { ContextActionsProvider } from './ContextActions';
import FileExplorer from './FileExplorer/FileExplorer';

const App = () => {
	return (
		<div className="App text-white">
			<ContextActionsProvider>
				<FileExplorer />
			</ContextActionsProvider>
		</div>
	);
};

export default App;
