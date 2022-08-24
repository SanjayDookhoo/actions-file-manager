import { createContext, useState } from 'react';
import FileExplorer from './FileExplorer';

const initialTestData = [
	{
		path: '/',
		type: 'folder',
		name: 'Home 1',
	},
	{
		path: '/',
		type: 'folder',
		name: 'Home 2',
	},
	{
		path: '/',
		type: 'folder',
		name: 'Home 3',
	},
	{
		path: '/documents',
		type: 'folder',
		name: 'document 1',
	},
	{
		path: '/documents',
		type: 'file',
		name: 'document 2',
	},
	{
		path: '/downloads',
		type: 'folder',
		name: 'downloads 1',
	},
	{
		path: '/downloads',
		type: 'file',
		name: 'downloads 2',
	},
	{
		path: '/downloads',
		type: 'folder',
		name: 'downloads 3',
	},
];
export const TestDataContext = createContext();

const App = () => {
	const [testData, setTestData] = useState(initialTestData);
	const value = { testData, setTestData };

	return (
		<div className="App">
			<TestDataContext.Provider value={value}>
				<FileExplorer />
			</TestDataContext.Provider>
		</div>
	);
};

export default App;
