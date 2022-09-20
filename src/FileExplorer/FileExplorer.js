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
import { axiosClientFileExtension, backendEndpointWS } from './endpoint';

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

	const initialFolderArguments = {
		where: { parentFolderId: { _isNull: true } },
	};
	const initialFileArguments = { where: { folderId: { _isNull: true } } };
	const [folderArguments, setFolderArguments] = useState(
		initialFolderArguments
	);
	const [fileArguments, setFileArguments] = useState(initialFileArguments);
	const [fileExtensionsMap, setFileExtensionsMap] = useState({});
	const [filtered, setFiltered] = useState([]);

	const [files, setFiles] = useState([]);
	const [folders, setFolders] = useState([]);

	useEffect(() => {
		const socket = new WebSocket(backendEndpointWS);
		socket.addEventListener('open', () => {
			const socketMessageFile = {
				subscriptionOf: 'File',
				args: fileArguments,
			};
			const socketMessageFolder = {
				subscriptionOf: 'Folder',
				args: folderArguments,
			};

			socket.send(JSON.stringify(socketMessageFile));
			socket.send(JSON.stringify(socketMessageFolder));
		});

		socket.addEventListener('message', (message) => {
			const { subscriptionOf, data } = JSON.parse(message.data);
			if (subscriptionOf == 'File') {
				setFiles(
					data.file.map((record) => ({
						...record,
						__typename: subscriptionOf,
					}))
				);
			} else if (subscriptionOf == 'Folder') {
				setFolders(
					data.folder.map((record) => ({
						...record,
						__typename: subscriptionOf,
					}))
				);
			}
		});
		return () => {
			socket.close();
		};
	}, [fileArguments, folderArguments]);

	useEffect(() => {
		const promises = [];
		const fileExtensions = files
			.filter((file) => file.name.split('.')[0])
			.map((file) => file.name.split('.').pop());
		const fileExtensionsUnique = [...new Set(fileExtensions)];
		const tempFileExtensionsMap = {};

		for (const extension of fileExtensionsUnique) {
			promises.push(
				axiosClientFileExtension({
					url: '/details',
					method: 'GET',
					params: {
						extension,
					},
				})
			);
		}

		Promise.all(promises).then(async (allResponses) => {
			allResponses.forEach((response, i) => {
				if (response.status == 200) {
					tempFileExtensionsMap[fileExtensionsUnique[i]] = response.data;
					setFileExtensionsMap(tempFileExtensionsMap);
				}
			});
		});
	}, [files]);

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
		setFolderArguments,
		setFileArguments,
		folders,
		files,
		fileExtensionsMap,
		filtered,
		setFiltered,
	};

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
