import { useContext, useEffect, useState } from 'react';
import { TestDataContext } from '../App';
import Tabs from './Tabs';

const FileExplorer = () => {
	const { testData, setTestData } = useContext(TestDataContext);

	// useEffect(() => {
	// 	console.log(
	// 		'🚀 ~ file: index.js ~ line 11 ~ FileExplorer ~ testData',
	// 		testData
	// 	);
	// }, [testData]);

	// useEffect(() => {
	// 	setTestData(5);
	// }, []);

	const [state, setState] = useState([
		{
			tab_number: 0, // starts at 0
			selected: null, // folder or file id
			multi_select_active: false,
			path: '/',
		},
	]);
	return (
		<div>
			<Tabs />
		</div>
	);
};

export default FileExplorer;
