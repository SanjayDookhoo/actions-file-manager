import { useContext, useEffect, useState } from 'react';
import NavigationBar from './NavigationBar/NavigationBar';
import Tabs from './Tabs/Tabs';
import { initialTabState } from './Tabs/constants';
import { v4 as uuidv4 } from 'uuid';
import LeftPane from './LeftPane/LeftPane';
import DirectoryView from './DirectoryView/DirectoryView';
import './CustomReactMenu/custom-css.css';

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
		<div
			className="fileExplorer w-full h-screen flex flex-col bg-zinc-700"
			onContextMenu={(e) => e.preventDefault()}
		>
			<Tabs {...tabsProps} />
			{activeTabId && (
				<>
					<NavigationBar {...tabsProps} />
					<div className="w-full flex flex-grow">
						<LeftPane />
						<DirectoryView />
					</div>
				</>
			)}
		</div>
	);
};

export default FileExplorer;
