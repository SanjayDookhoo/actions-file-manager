import {
	createContext,
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
import './assets/googleFonts.css';
import {
	defaultConditionalColor,
	initialLocalStorageState,
	toastAutoClose,
} from './utils/constants';
import { axiosClientFileExtension } from './endpoint';
import {
	errorRender,
	getFolderId,
	hexToRgb,
	rgbAddA,
	update,
} from './utils/utils';
import Modal from './Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import rgbaToRgb from 'rgba-to-rgb';
import axios from 'axios';
import GetFilesFolders from './GetFilesFolders';

export const FileManagerContext = createContext();

const localStorageKey = 'actions-file-manager-v1'; // versioned, in case localstorage access is changed, can migrate the old to new version, and continue with the new version

const FileManager = ({
	height = '100%',
	width = '100%',
	color = defaultConditionalColor,
	themeSettings = 'light',
	actions,
	backendHostname,
	tokenNameInLocalStorage = 'token',
}) => {
	const [initialTabId, setInitialTabId] = useState(uuidv4());
	const [tabsState, setTabsState] = useState({
		[initialTabId]: { ...initialTabState, order: 0 },
	});
	const [activeTabId, setActiveTabId] = useState(initialTabId);
	const [newTabOrder, setNewtabOrder] = useState(1);
	const [closedTabs, setClosedTabs] = useState({});
	const fileManagerRef = useRef();
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

	const [paste, setPaste] = useState(null);
	const [firstLoad, setFirstLoad] = useState(true);
	const [subscriptionLoading, setSubscriptionLoading] = useState(true);
	const [subscriptionError, setSubscriptionError] = useState(false);
	const [rootUserFolderId, setRootUserFolderId] = useState(null);
	const [sharedAccessType, setSharedAccessType] = useState(null);
	const [modal, setModal] = useState(null);

	const [prefersColorSchemeDark, setPrefersColorSchemeDark] = useState(
		window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
	);
	const [theme, setTheme] = useState('light');

	const [fileManagerWidth, setFileManagerWidth] = useState(0);

	// CORS errors in testing may require changing from secured to unsecured
	const backendEndpointWS = `wss://${backendHostname}`;
	const backendEndpoint = `https://${backendHostname}`;
	const token = window.localStorage.getItem(tokenNameInLocalStorage);

	const axiosClientJSON = axios.create({
		baseURL: backendEndpoint,
		headers: {
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`,
		},
	});

	useLayoutEffect(() => {
		fileManagerRef.current.focus();
	}, [folderId]);

	useEffect(() => {
		// if this component is placed in something that has multiple rerenders close together, this prevents creating the rootUserFolder multiple times
		const getRootUserFolderKey = `${localStorageKey}-getRootUserFolder`;
		const state = window.localStorage.getItem(getRootUserFolderKey);
		let timeout = 0;
		if (!state) {
			timeout = 250;

			window.localStorage.setItem(getRootUserFolderKey, true);
			setTimeout(() => {
				window.localStorage.removeItem(getRootUserFolderKey);
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
				if (response.status === 200) {
					tempFileExtensionsMap[fileExtensionsUnique[i]] = response.data;
					setFileExtensionsMap(tempFileExtensionsMap);
				}
			});
		});
	}, [files]);

	const handlePaste = () => {
		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		const res = axiosClientJSON({
			url: '/paste',
			method: 'POST',
			data: {
				folderId,
			},
		})
			.then((res) => {
				if (paste === 'cut') setPaste(null);
			})
			.catch((err) => {
				setPaste(null);
				throw err;
			});

		const operationPending = paste === 'cut' ? 'Moving' : 'Copying';
		const operationSuccess = paste === 'cut' ? 'Moved' : 'Copied';
		const operationError = paste === 'cut' ? 'move' : 'copy';

		toast.promise(res, {
			pending: `${operationPending} item/s`,
			success: `${operationSuccess} item/s`,
			// error: `Failed to ${operationError} item/s`,
			error: {
				render: ({ data }) =>
					errorRender({
						msg: `Failed to ${operationError} item/s`,
						data,
					}),
			},
		});
	};

	const renderName = (record) => {
		const { name = '', __typename } = record;
		if (__typename === 'folder') {
			return name;
		}
		const nameSplit = name.split('.');
		// !localStorage.showFileExtensions && localStorage.showHiddenItems, this is because a hidden item starts with a dot(.), so the rest of the name should not be considered a extension
		if (
			localStorage.showFileExtensions ||
			(!localStorage.showFileExtensions &&
				localStorage.showHiddenItems &&
				!nameSplit[0])
		) {
			return name;
		} else {
			return nameSplit.slice(0, nameSplit.length - 1).join('.');
		}
	};

	useEffect(() => {
		let theme;
		if (themeSettings !== 'systemDefault') {
			theme = themeSettings;
		} else {
			theme = prefersColorSchemeDark ? 'dark' : 'light';
		}
		setTheme(theme);
	}, [themeSettings, prefersColorSchemeDark]);

	const rgba2rgb = (rgba) => {
		return rgbaToRgb('rgb(255, 255, 255)', rgba);
	};

	// theme changes to custom-css
	useEffect(() => {
		const light = ['0', '0.1', '0.2', '0.3'];
		const dark = ['0.9', '0.8', '0.7', '0.6'];
		const fileManager = fileManagerRef.current;
		const rgbColor = hexToRgb(color);
		const black = 'rgb(0,0,0)';
		if (theme === 'light') {
			light.forEach((alpha, i) => {
				fileManager.style.setProperty(
					`--bg-shade-${i + 1}`,
					rgba2rgb(rgbAddA(black, alpha))
				);
			});
			if (rgbColor) {
				fileManager.style.setProperty(
					`--conditional-color`,
					rgba2rgb(rgbAddA(rgbColor, '1'))
				);
			} else {
				fileManager.style.setProperty(
					`--conditional-color`,
					rgba2rgb(rgbAddA(black, light[3]))
				);
			}
		} else {
			dark.forEach((alpha, i) => {
				fileManager.style.setProperty(
					`--bg-shade-${i + 1}`,
					rgba2rgb(rgbAddA(black, alpha))
				);
			});
			if (rgbColor) {
				fileManager.style.setProperty(
					`--conditional-color`,
					rgba2rgb(rgbAddA(rgbColor, '1'))
				);
			} else {
				fileManager.style.setProperty(
					`--conditional-color`,
					rgba2rgb(rgbAddA(black, dark[3]))
				);
			}
		}
	}, [theme, color]);

	useEffect(() => {
		const eventHandler = (e) => {
			setPrefersColorSchemeDark(e.matches);
		};
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', eventHandler);
		return () => {
			window
				.matchMedia('(prefers-color-scheme: dark)')
				.removeEventListener('change', eventHandler);
		};
	}, []);

	useLayoutEffect(() => {
		const fileManager = fileManagerRef.current;
		const handleResizeObserver = () => {
			const width = fileManager.offsetWidth;
			setFileManagerWidth(width);
		};
		const observer = new ResizeObserver(handleResizeObserver);
		observer.observe(fileManager);
		return () => {
			observer.unobserve(fileManager);
		};
	}, []);

	const breakpointClass = (breakpoints) => {
		const breakpointMap = {
			'2xl': 1536,
			xl: 1280,
			lg: 1024,
			md: 768,
			sm: 640,
		};

		for (const [key, value] of Object.entries(breakpointMap)) {
			if (breakpoints[key] && fileManagerWidth >= value)
				return breakpoints[key];
		}
		if (breakpoints.default) return breakpoints.default;
		else return '';
	};

	const value = {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		fileManagerRef,
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
		renderName,
		color,
		theme,
		actions,
		breakpointClass,
		axiosClientJSON,
		backendEndpointWS,
		firstLoad,
		tokenNameInLocalStorage,
	};

	const getFilesFoldersProps = {
		setFiles,
		setFolders,
		setSharedAccessType,
		setSubscriptionLoading,
		folderId,
		setFirstLoad,
	};

	return (
		<FileManagerContext.Provider value={value}>
			<GetFilesFolders {...getFilesFoldersProps} />
			<div
				tabIndex={-1}
				className="actions-file-manager"
				style={{
					height,
					width,
					color: theme === 'dark' ? 'white' : 'black',
				}}
				ref={fileManagerRef}
				onContextMenu={(e) => e.preventDefault()}
			>
				<div className="flex flex-col relative bg-shade-1 w-full h-full">
					<ToastContainer
						position="top-right"
						autoClose={toastAutoClose}
						hideProgressBar
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						draggable
						pauseOnHover
						theme={theme}
					/>
					<Modal modal={modal} setModal={setModal} />
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
			</div>
		</FileManagerContext.Provider>
	);
};

export default FileManager;
