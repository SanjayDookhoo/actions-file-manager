import { useContext, useEffect, useState } from 'react';
import { TestDataContext } from '../App';

const FileExplorer = () => {
	const { testData, setTestData } = useContext(TestDataContext);

	useEffect(() => {
		console.log(
			'🚀 ~ file: index.js ~ line 11 ~ FileExplorer ~ testData',
			testData
		);
	}, [testData]);

	useEffect(() => {
		setTestData(5);
	}, []);

	const [state, setState] = useState([
		{
			tab_number: 0, // starts at 0
			selected: null, // folder or file id
			multi_select_active: false,
			path: '/',
		},
	]);
	return <div>FileExplorer</div>;
};

export default FileExplorer;
