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
import {
	initialLocalStorageState,
	newFolderNameDefault,
} from './utils/constants';
import {
	axiosClientFileExtension,
	axiosClientJSON,
	backendEndpointWS,
} from './endpoint';
import { getFolderId, update } from './utils/utils';
import useWebSocket from 'react-use-websocket';
import NewFolder from './NewFolder';
import SharingLinks from './SharingLinks';
import useSubscription from './useSubscription';
import Modal from './Modal';

export const FileExplorerContext = createContext();

const localStorageKey = 'fileExplorer-v1'; // versioned, in case localstorage access is changed, can migrate the old to new version, and continue with the new version

const FileExplorer = ({ height, width }) => {
	const [initialTabId, setInitialTabId] = useState(uuidv4());
	const [tabsState, setTabsState] = useState({
		[initialTabId]: { ...initialTabState, order: 0 },
	});
	const [activeTabId, setActiveTabId] = useState(initialTabId);
	const [newTabOrder, setNewtabOrder] = useState(1);
	const [closedTabs, setClosedTabs] = useState({});
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

	const [folderId, setFolderId] = useState();
	const [fileExtensionsMap, setFileExtensionsMap] = useState({});
	const [filtered, setFiltered] = useState([]);

	const [files, setFiles] = useState([]);
	const [folders, setFolders] = useState([]);

	const [_files, filesLoading, filesError] = useSubscription(folderId, 'file');
	const [_folders, foldersLoading, foldersError] = useSubscription(
		folderId,
		'folder'
	);

	const [paste, setPaste] = useState(null);
	const [subscriptionLoading, setSubscriptionLoading] = useState(true);
	const [subscriptionError, setSubscriptionError] = useState(false);
	const [rootUserFolderId, setRootUserFolderId] = useState(null);
	const [sharedAccessType, setSharedAccessType] = useState(null);
	const [modal, setModal] = useState(null);

	useEffect(() => {
		// if this component is placed in something that has multiple rerenders close together, this prevents creating the rootUserFolder multiple times
		const localStoragekey = 'fileExplorer-v1-getRootUserFolder';
		const state = window.localStorage.getItem(localStoragekey);
		let timeout = 0;
		if (!state) {
			timeout = 250;

			window.localStorage.setItem(localStoragekey, true);
			setTimeout(() => {
				window.localStorage.removeItem(localStoragekey);
			}, timeout);
		}

		setTimeout(() => {
			axiosClientJSON({
				url: '/getRootUserFolder',
				method: 'POST',
			}).then((res) => {
				setRootUserFolderId(res.data.id);
			});
		}, timeout);
	}, []);

	useEffect(() => {
		setSubscriptionLoading(filesLoading || foldersLoading);
	}, [filesLoading, foldersLoading]);

	useEffect(() => {
		if (rootUserFolderId) {
			const currentFolderId =
				tabsState[activeTabId]?.path[tabsState[activeTabId].path.length - 1];

			setFolderId(currentFolderId);
		}
	}, [tabsState[activeTabId].path, rootUserFolderId]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const link = params.get('link');

		if (link) {
			axiosClientJSON({
				url: '/addSharedWithMe',
				method: 'POST',
				data: {
					link,
				},
			});

			const file = files.find((file) => {
				const sharingPermissionLinks =
					file.meta.sharingPermission.sharingPermissionLinks;
				return sharingPermissionLinks.map((el) => el.link).includes(link);
			});
			const folder = folders.find((folder) => {
				const sharingPermissionLinks =
					folder.meta.sharingPermission.sharingPermissionLinks;
				return sharingPermissionLinks.map((el) => el.link).includes(link);
			});

			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						path: { $set: ['Shared with me'] },
						history: {
							paths: { $set: ['Shared with me'] },
							currentIndex: { $set: 0 },
						},
						selectedFiles: { $set: file ? [file.id] : [] },
						selectedFolders: { $set: folder ? [folder.id] : [] },
					},
				})
			);

			if (file || folder) {
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
			}
		}
	}, [window.location, files, folders]);

	useEffect(() => {
		if (_files) {
			const { data, accessType } = _files;
			setFiles(
				data.file.map((record) => ({
					...record,
					__typename: 'file',
				}))
			);
			setSharedAccessType(accessType);
		}
	}, [_files]);

	useEffect(() => {
		if (_folders) {
			const { data, accessType } = _folders;
			setFolders(
				data.folder.map((record) => ({
					...record,
					__typename: 'folder',
				}))
			);
			setSharedAccessType(accessType);
		}
	}, [_folders]);

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

	const handlePaste = () => {
		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		axiosClientJSON({
			url: '/paste',
			method: 'POST',
			data: {
				folderId,
			},
		})
			.then((res) => {
				if (paste == 'cut') setPaste(null);
			})
			.catch((err) => {
				setPaste(null);
			});
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
		folders,
		files,
		fileExtensionsMap,
		filtered,
		setFiltered,
		paste,
		setPaste,
		subscriptionLoading,
		subscriptionError,
		handlePaste,
		rootUserFolderId,
		sharedAccessType,
		modal,
		setModal,
	};

	return (
		<FileExplorerContext.Provider value={value}>
			<Modal modal={modal} setModal={setModal} />
			<div
				className="fileExplorer flex flex-col bg-zinc-700"
				style={{ height, width }}
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
