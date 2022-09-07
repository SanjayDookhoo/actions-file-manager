import { useEffect, useReducer, useRef, useState } from 'react';
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
import FilesPlaceholder from '../../utils/FilesPlaceholder';
import { gql } from 'graphql-request';
import { inputPreprocessHasura } from '../../utils/utils';
import { axiosClient } from '../../endpoint';

const NewDropdown = () => {
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
		console.log(files);
		if (files.length > 0) {
			// TODO: upload files to backend
			let formData = new FormData();
			// the files are not stored in a normal array
			for (let i = 0; i < files.length; i++) {
				formData.append('file', files[i]);
			}

			const res = axiosClient({
				url: '/upload',
				method: 'POST',
				data: formData,
			});
			console.log(res);
		}
	}, [files]);

	const handleUpload = (e) => {
		setFiles(e.target.files);
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
				<FileMenuItem logo="folder" description="New folder" />
			</Menu>
		</>
	);
};

export default NewDropdown;
