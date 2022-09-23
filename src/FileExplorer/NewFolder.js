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
		newFolderName,
		setNewFolderName,
		setNewFolderIsOpen,
		rootUserFolderId,
	} = useContext(FileExplorerContext);
	const ref = useRef();

	const handleCancel = (e) => {
		// e.stopPropagation();
		setNewFolderName(newFolderNameDefault);
		setNewFolderIsOpen(false);
	};

	const handleCreate = (e) => {
		// e.stopPropagation();
		setNewFolderName(newFolderNameDefault);
		setNewFolderIsOpen(false);

		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		if (newFolderName) {
			const res = axiosClientJSON({
				url: '/createNewFolder',
				method: 'POST',
				data: {
					name: newFolderName,
					parentFolderId: folderId,
				},
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
		<div
			className="absolute left-0 top-0 w-full h-full flex justify-center items-center z-10"
			onClick={handleCancel}
		>
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
		</div>
	);
};

export default NewFolder;
