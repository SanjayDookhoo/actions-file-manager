import { createContext, useState } from 'react';
import { ContextActionsProvider } from './ContextActions';
import FileExplorer from './FileExplorer';

const App = () => {
	return (
		<div className="App">
			<ContextActionsProvider>
				<FileExplorer />
			</ContextActionsProvider>
		</div>
	);
};

export default App;
