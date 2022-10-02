import {
	useContext,
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { axiosClientJSON } from './endpoint';
import { FileExplorerContext } from './FileExplorer';
import { newFolderNameDefault } from './utils/constants';
import { getFolderId } from './utils/utils';

const NewFolder = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		setNewFolderIsOpen,
		rootUserFolderId,
		modal,
		setModal,
	} = useContext(FileExplorerContext);
	const ref = useRef();
	const [newFolderName, setNewFolderName] = useState(newFolderNameDefault);

	const handleCancel = (e) => {
		setModal(null);
	};

	const handleCreate = (e) => {
		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		if (newFolderName) {
			axiosClientJSON({
				url: '/createNewFolder',
				method: 'POST',
				data: {
					name: newFolderName,
					folderId,
				},
			}).then((res) => {
				setModal(null);
			});
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleCreate();
		}
	};

	useLayoutEffect(() => {
		ref.current.select();
	}, []);

	return (
		<div className="w-64 h-44 bg-gray-500 rounded-lg flex flex-col">
			<div className="p-2 px-4">New Folder</div>
			<input
				className="text-black m-4 p-2 rounded "
				ref={ref}
				type="text"
				value={newFolderName}
				onChange={(e) => setNewFolderName(e.target.value)}
				onKeyDown={handleKeyDown}
				onClick={(e) => e.stopPropagation()}
			/>
			<div className="flex justify-end p-4">
				<button onClick={handleCancel}>Cancel</button>
				<button onClick={handleCreate}>Create</button>
			</div>
		</div>
	);
};

export default NewFolder;
