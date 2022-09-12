import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import FilesOptions from '../../FilesOptions/FilesOptions';
import { buttonStyle } from '../../utils/constants';
import {
	Menu,
	MenuItem,
	FocusableItem,
	SubMenu,
	MenuRadioGroup,
	MenuDivider,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import FileSubMenu from '../../CustomReactMenu/FileSubMenu';
import { gql } from 'graphql-request';
import { axiosClientJSON } from '../../endpoint';
import { getFolderId, uploadFiles } from '../../utils/utils';
import { FileExplorerContext } from '../../FileExplorer';

const NewDropdown = () => {
	const { tabsState, setTabsState, activeTabId, setActiveTabId } =
		useContext(FileExplorerContext);
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
		const folderId = getFolderId({ tabsState, activeTabId });
		uploadFiles(files, folderId);
	}, [files]);

	const handleUpload = (e) => {
		setFiles(e.target.files);
	};

	const handleNewFolderOnClick = (e) => {
		const folderId = getFolderId({ tabsState, activeTabId });
		const folderName = prompt('Enter folder name', '');
		if (folderName) {
			const res = axiosClientJSON({
				url: '/createNewFolder',
				method: 'POST',
				data: {
					folderName,
					parentFolderId: folderId,
				},
			});
			console.log(res);
		}
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
			<Menu
				menuButton={
					<a className="flex items-center" title="cut">
						<span className={buttonStyle}>add</span>
						New
					</a>
				}
			>
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
			</Menu>
		</>
	);
};

export default NewDropdown;
