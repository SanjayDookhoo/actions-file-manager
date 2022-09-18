import {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import NavigationBar from './NavigationBar/NavigationBar';
import Tabs from './Tabs/Tabs';
import { initialTabState } from './Tabs/constants';
import { v4 as uuidv4 } from 'uuid';
import LeftPane from './LeftPane/LeftPane';
import DirectoryView from './DirectoryView/DirectoryView';
import './CustomReactMenu/custom-css.css';
import { initialLocalStorageState } from './utils/constants';

export const FileExplorerContext = createContext();

const localStorageKey = 'fileExplorer-v1'; // versioned, in case localstorage access is changed, can migrate the old to new version, and continue with the new version

const FileExplorer = () => {
	const [initialTabId, setInitialTabId] = useState(uuidv4());
	const [tabsState, setTabsState] = useState({
		[initialTabId]: { ...initialTabState, order: 0 },
	});
	const [activeTabId, setActiveTabId] = useState(initialTabId);
	const [newTabOrder, setNewtabOrder] = useState(1);
	const [closedTabs, setClosedTabs] = useState([]);
	const fileExplorerRef = useRef();
	const [localStorage, _setLocalStorage] = useState(() => {
		const data = window.localStorage.getItem(localStorageKey);
		if (data) return JSON.parse(data);
		else {
			window.localStorage.setItem(
				localStorageKey,
				JSON.stringify(initialLocalStorageState)
			);
			return initialLocalStorageState;
		}
	});

	const setLocalStorage = (data) => {
		_setLocalStorage(data);
		window.localStorage.setItem(localStorageKey, JSON.stringify(data));
	};

	const value = {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		fileExplorerRef,
		newTabOrder,
		setNewtabOrder,
		closedTabs,
		setClosedTabs,
		localStorage,
		setLocalStorage,
	};

	// useEffect(() => {
	// 	console.log(tabsState, activeTabId);
	// }, [tabsState, activeTabId]);

	return (
		<FileExplorerContext.Provider value={value}>
			<div
				className="fileExplorer w-full h-screen flex flex-col bg-zinc-700"
				ref={fileExplorerRef}
				onContextMenu={(e) => e.preventDefault()}
			>
				<Tabs />
				{activeTabId && (
					<>
						<NavigationBar />
						<div className="w-full flex flex-grow">
							<LeftPane />
							<DirectoryView />
						</div>
					</>
				)}
			</div>
		</FileExplorerContext.Provider>
	);
};

export default FileExplorer;
