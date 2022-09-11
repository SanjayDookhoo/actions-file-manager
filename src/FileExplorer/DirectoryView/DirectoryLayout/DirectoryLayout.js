import { useEffect, useState } from 'react';
import {
	ControlledMenu,
	FocusableItem,
	MenuDivider,
	MenuItem,
	useMenuState,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { buttonStyle } from '../../utils/constants';
import FileFocusableItem from '../../CustomReactMenu/FileFocusableItem';
import FileUploadDiv from '../../FileUploadDiv/FileUploadDiv';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { objectToGraphqlArgs } from 'hasura-args';

const initialVisibleColumns = {
	name: true,
	dateCreated: true,
	dateModified: true,
	type: true,
	size: true,
};

const folderArguments = { where: { parentFolderId: { _isNull: true } } };
const fileArguments = { where: { folderId: { _isNull: true } } };

const folderSubscriptionGraphql = gql`
	subscription {
		folder(${objectToGraphqlArgs(folderArguments)}) {
			id
			folderName
		}
	}
`;

const fileSubscriptionGraphql = gql`
	subscription {
		file(${objectToGraphqlArgs(fileArguments)}) {
			id
			fileName
		}
	}
`;

const DirectoryLayout = () => {
	// const { loading, error, data } = useSubscription(folderSubscriptionGraphql);
	const { data: folders } = useSubscription(folderSubscriptionGraphql);
	const { data: files } = useSubscription(fileSubscriptionGraphql);

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [contextMenuOf, setContextMenuOf] = useState(null);

	const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

	useEffect(() => {
		console.log(folders, files);
	}, [folders, files]);

	const handleOnContextMenu = (e) => {
		let target = e.target;
		while (
			!target.classList.contains('fileExplorer') &&
			!target.classList.contains('directoryLayoutDetailsHeader') &&
			!target.classList.contains('directoryLayoutFolder') &&
			!target.classList.contains('directoryLayoutFile')
		) {
			target = target.parentElement;
		}
		if (target.classList.contains('directoryLayoutDetailsHeader')) {
			setContextMenuOf('directoryLayoutDetailsHeader');
		} else if (target.classList.contains('directoryLayoutFolder')) {
			setContextMenuOf('directoryLayoutFolder');
		} else if (target.classList.contains('directoryLayoutFile')) {
			setContextMenuOf('directoryLayoutFile');
		} else {
			setContextMenuOf('directoryLayoutEmptySpace');
		}

		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	return (
		<div className="w-full" onContextMenu={handleOnContextMenu}>
			<FileUploadDiv parentFolderId={null}>
				<div>
					{folders &&
						folders.folder.map((folder) => (
							<FileUploadDiv key={folder.id} parentFolderId={folder.id}>
								<div className="directoryLayoutFolder flex">
									<div style={{ width: '25%' }}>{folder.folderName}</div>
									<div style={{ width: '25%' }}>a</div>
									<div style={{ width: '25%' }}>b</div>
									<div style={{ width: '25%' }}>c</div>
								</div>
							</FileUploadDiv>
						))}
					{files &&
						files.file.map((file) => (
							<div className="directoryLayoutFolder flex">
								<div style={{ width: '25%' }}>{file.fileName}</div>
								<div style={{ width: '25%' }}>a</div>
								<div style={{ width: '25%' }}>b</div>
								<div style={{ width: '25%' }}>c</div>
							</div>
						))}
				</div>

				<ControlledMenu
					{...menuProps}
					anchorPoint={anchorPoint}
					onClose={() => toggleMenu(false)}
				>
					<div className="w-64">
						{contextMenuOf == 'directoryLayoutDetailsHeader' && (
							<>
								<FileMenuItem
									controlledStatePadding={true}
									description="Size all columns to fit"
								/>
								<MenuDivider />
								{Object.entries(visibleColumns).map(([column, value]) => (
									<FileMenuItem
										type="checkbox"
										checked={value}
										onClick={(e) =>
											setVisibleColumns({
												...visibleColumns,
												[column]: e.checked,
											})
										}
										description={column}
									/>
								))}
							</>
						)}
						{contextMenuOf == 'directoryLayoutFolder' && (
							<>
								<FileFocusableItem title="cut" icon="cut" />
								<FileFocusableItem title="copy" icon="content_copy" />
								<FileFocusableItem title="paste" icon="content_paste" />
								<FileFocusableItem
									title="share"
									icon="drive_file_rename_outline"
								/>
								<FileFocusableItem title="delete" icon="delete" />
								<MenuDivider />
								<FileMenuItem description="Open in new tab" />
								<FileMenuItem description="Add to favorites" />
							</>
						)}
						{contextMenuOf == 'directoryLayoutFile' && (
							<>
								<FileFocusableItem title="cut" icon="cut" />
								<FileFocusableItem title="copy" icon="content_copy" />
								<FileFocusableItem title="paste" icon="content_paste" />
								<FileFocusableItem
									title="share"
									icon="drive_file_rename_outline"
								/>
								<FileFocusableItem title="delete" icon="delete" />
								<MenuDivider />
								<FileMenuItem description="Create folder with selection" />
							</>
						)}

						{contextMenuOf == 'directoryLayoutEmptySpace' && <></>}
					</div>
				</ControlledMenu>
			</FileUploadDiv>
		</div>
	);
};

export default DirectoryLayout;
