import { ControlledMenu, useMenuState } from '@szhsin/react-menu';
import { useContext, useEffect, useState } from 'react';
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
					{item.type == 'folder' && (
						<FileUploadDiv folderId={record.id}>
							<Layout {...layoutProps} />
						</FileUploadDiv>
					)}

					{item.type == 'file' && (
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
						<div className="w-64">File/Folder Test</div>
					</ControlledMenu>
				</div>
			)}
		</>
	);
};

export default Item;
