import { useContext, useEffect, useState } from 'react';
import { TestDataContext } from '../App';
import NavigationBar from './NavigationBar';
import Tabs from './Tabs';
import { initial_tab_state } from './Tabs/constants';

const FileExplorer = () => {
	// const { testData, setTestData } = useContext(TestDataContext);

	// useEffect(() => {
	// 	console.log(
	// 		'🚀 ~ file: index.js ~ line 11 ~ FileExplorer ~ testData',
	// 		testData
	// 	);
	// }, [testData]);

	// useEffect(() => {
	// 	setTestData(5);
	// }, []);

	const [tabs_state, setTabsState] = useState([initial_tab_state]);

	const tabs_props = {
		tabs_state,
		setTabsState,
	};

	return (
		<div className="w-full h-screen">
			<Tabs {...tabs_props} />
			<NavigationBar />
		</div>
	);
};

export default FileExplorer;
