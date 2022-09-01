import { useContext, useEffect, useState } from 'react';
import NavigationBar from './NavigationBar';
import Tabs from './Tabs';
import { initialTabState } from './Tabs/constants';
import { v4 as uuidv4 } from 'uuid';

const FileExplorer = () => {
	const [initialTabId, setInitialTabId] = useState(uuidv4());
	const [tabsState, setTabsState] = useState([
		{ ...initialTabState, tabId: initialTabId },
	]);
	const [activeTabId, setActiveTabId] = useState(initialTabId);
	const [activeTab, setActiveTab] = useState(null);

	useEffect(() => {
		const tempActiveTab = tabsState.find((tab) => tab.tabId == activeTabId);
		setActiveTab(tempActiveTab);
	}, [tabsState, activeTabId]);

	const tabsProps = {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		activeTab,
	};

	return (
		<div className="w-full h-screen">
			<Tabs {...tabsProps} />
			{activeTabId && <NavigationBar {...tabsProps} />}
		</div>
	);
};

export default FileExplorer;
