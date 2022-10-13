import {
	useContext,
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { toast } from 'react-toastify';
import Button from './Button';
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
		e.stopPropagation();
		setModal(null);
	};

	const handleCreate = (e) => {
		e.stopPropagation();
		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		if (newFolderName) {
			const res = axiosClientJSON({
				url: '/createNewFolder',
				method: 'POST',
				data: {
					name: newFolderName,
					folderId,
				},
			}).then((res) => {
				setModal(null);
			});

			toast.promise(res, {
				pending: `Creating folder "${newFolderName}"`,
				success: `Created folder "${newFolderName}"`,
				error: {
					render({ data }) {
						const { errors } = data.response.data;
						if (errors) {
							const tooLong = errors.find((error) =>
								error.message.includes('too long')
							);
							if (tooLong) {
								const charLimit = tooLong.message
									.replace('value too long for type character varying(', '')
									.replace(')', '');
								return `Failed to create folder, needs to be less than ${charLimit} chars`;
							}
						}

						return `Failed to create folder "${newFolderName}"`;
					},
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
		<div className="w-64 h-fit rounded-lg flex flex-col bg-shade-3 p-2">
			<div className="text-2xl">Folder</div>
			<input
				className="text-black my-2 p-2 rounded "
				ref={ref}
				type="text"
				value={newFolderName}
				onChange={(e) => setNewFolderName(e.target.value)}
				onKeyDown={handleKeyDown}
				onClick={(e) => e.stopPropagation()}
			/>
			<div className="flex justify-end pt-2">
				<Button className="ml-1" onClick={handleCancel}>
					Cancel
				</Button>
				<Button className="ml-1" onClick={handleCreate}>
					Create
				</Button>
			</div>
		</div>
	);
};

export default NewFolder;
