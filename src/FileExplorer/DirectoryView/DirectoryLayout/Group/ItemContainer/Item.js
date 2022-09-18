import { ControlledMenu, MenuDivider, useMenuState } from '@szhsin/react-menu';
import { useContext, useEffect, useState } from 'react';
import FileFocusableItem from '../../../../CustomReactMenu/FileFocusableItem';
import FileMenuItem from '../../../../CustomReactMenu/FileMenuItem';
import FileUploadDiv from '../../../../FileUploadDiv/FileUploadDiv';
import Layout from './Layout/Layout';
const Item = ({ item, getRecord, fileExtensionsMap }) => {
	const [record, setRecord] = useState({});
	const [menuProps, toggleMenuHeader] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

	useEffect(() => {
		setRecord(getRecord(item));
	}, [item]);

	const handleOnContextMenu = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenuHeader(true);
	};

	const layoutProps = {
		record,
		fileExtensionsMap,
	};

	return (
		<>
			{record && (
				<div onContextMenu={handleOnContextMenu}>
					{item.__typename == 'Folder' && (
						<FileUploadDiv folderId={record.id}>
							<Layout {...layoutProps} />
						</FileUploadDiv>
					)}

					{item.__typename == 'File' && (
						<div
							// similar class to what FileUploadDiv uses, without the hover over with files effect
							className={
								'm-1 p-1 w-fit h-fit border-dashed border border-transparent'
							}
						>
							<Layout {...layoutProps} />
						</div>
					)}

					<ControlledMenu
						{...menuProps}
						anchorPoint={anchorPoint}
						onClose={() => toggleMenuHeader(false)}
					>
						<div className="w-64">
							<FileFocusableItem title="cut" icon="cut" />
							<FileFocusableItem title="copy" icon="content_copy" />
							<FileFocusableItem title="paste" icon="content_paste" />
							<FileFocusableItem
								title="share"
								icon="drive_file_rename_outline"
							/>
							<FileFocusableItem title="delete" icon="delete" />
							<MenuDivider />
							{record.__typename == 'Folder' ? (
								<>
									<FileMenuItem description="Create folder with selection" />
								</>
							) : (
								<>
									<FileMenuItem description="Open in new tab" />
									<FileMenuItem description="Add to favorites" />
								</>
							)}
						</div>
					</ControlledMenu>
				</div>
			)}
		</>
	);
};

export default Item;
