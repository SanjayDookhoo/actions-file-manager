import { useContext, useEffect, useState } from 'react';
import { TestDataContext } from '../App';
import NavigationBar from './NavigationBar';
import Tabs from './Tabs';
import { initialTabState } from './Tabs/constants';

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

	const [tabsState, setTabsState] = useState([initialTabState]);

	const tabsProps = {
		tabsState,
		setTabsState,
	};

	return (
		<div className="w-full h-screen">
			<Tabs {...tabsProps} />
			<NavigationBar />
		</div>
	);
};

export default FileExplorer;
