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
import { gql } from 'graphql-request';
import { axiosClientFiles, axiosClientJSON } from '../../endpoint';

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
			const filesPath = [];
			// the files are not stored in a normal array
			for (let i = 0; i < files.length; i++) {
				const { webkitRelativePath, name } = files[i];
				formData.append('file', files[i]);
				const filePath = webkitRelativePath.replace(`/${name}`, '');
				filesPath.push(filePath);
			}
			formData.append('filesPath', JSON.stringify(filesPath));

			const res = axiosClientFiles({
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

	const handleNewFolderOnClick = (e) => {
		const res = axiosClientJSON({
			url: '/createNewFolder',
			method: 'POST',
			data: {
				folderName: prompt('Enter folder name', ''),
			},
		});
		console.log(res);
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
