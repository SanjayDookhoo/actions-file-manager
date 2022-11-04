import { useContext, useEffect, useRef, useState } from 'react';
import { MenuDivider } from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { getFolderId, uploadFiles } from '../../utils/utils';
import { FileManagerContext } from '../../FileManager';
import NewFolder from '../../NewFolder';

const NewDropdown = () => {
	const {
		tabsState,
		activeTabId,
		rootUserFolderId,
		setModal,
		axiosClientJSON,
	} = useContext(FileManagerContext);
	const fileUploadRef = useRef();
	const folderUploadRef = useRef();
	const [files, setFiles] = useState([]);

	const handleFileUploadOnClick = () => {
		fileUploadRef.current.value = '';
		fileUploadRef.current.click();
	};

	const handleFolderUploadOnClick = () => {
		folderUploadRef.current.value = '';
		folderUploadRef.current.click();
	};

	useEffect(() => {
		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		uploadFiles(files, folderId, axiosClientJSON);
	}, [files]);

	const handleUpload = (e) => {
		setFiles(e.target.files);
	};

	const handleNewFolderOnClick = (e) => {
		setModal({
			isOpen: true,
			component: NewFolder,
		});
	};

	return (
		<>
			<input
				className="hidden"
				ref={fileUploadRef}
				type="file"
				multiple
				onChange={handleUpload}
			/>
			<input
				className="hidden"
				ref={folderUploadRef}
				type="file"
				webkitdirectory=""
				mozdirectory=""
				onChange={handleUpload}
			/>

			<FileMenuItem
				onClick={handleFileUploadOnClick}
				logo="folder"
				description="Upload file"
			/>
			<FileMenuItem
				onClick={handleFolderUploadOnClick}
				logo="folder"
				description="Upload folder"
			/>
			<MenuDivider />
			<FileMenuItem
				onClick={handleNewFolderOnClick}
				logo="folder"
				description="New folder"
			/>
		</>
	);
};

export default NewDropdown;
