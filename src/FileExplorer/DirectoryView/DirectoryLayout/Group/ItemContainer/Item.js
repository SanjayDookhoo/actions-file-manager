import { ControlledMenu, MenuDivider, useMenuState } from '@szhsin/react-menu';
import { useContext, useEffect, useState } from 'react';
import FileFocusableItem from '../../../../CustomReactMenu/FileFocusableItem';
import FileMenuItem from '../../../../CustomReactMenu/FileMenuItem';
import FileUploadDiv from '../../../../FileUploadDiv/FileUploadDiv';
import Layout from './Layout/Layout';

import { gql, useQuery } from '@apollo/client';
import { objectToGraphqlArgs } from 'hasura-args';
import { graphQLClient } from '../../../../endpoint';

const Item = ({ item, getRecord }) => {
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

	const downloadFile = (record) => {
		const { id } = record;

		const queryArgs = {
			id,
		};
		const query = gql`
			query {
				fileByPk(${objectToGraphqlArgs(queryArgs)}) {
					fileLink {
						URL
					}
				}
			}
		`;
		graphQLClient.request(query).then((res) => {
			const { URL } = res.fileByPk.fileLink;
			window.open(URL, '_blank');
		});
	};

	const layoutProps = {
		record,
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
								title="rename"
								icon="drive_file_rename_outline"
							/>
							<FileFocusableItem title="delete" icon="delete" />
							<MenuDivider />
							{record.__typename == 'Folder' ? (
								<>
									<FileMenuItem description="Open in new tab" />
									<FileMenuItem description="Add to favorites" />
									<FileMenuItem description="Create folder with selection" />
								</>
							) : (
								<>
									<FileMenuItem
										description="Download"
										onClick={() => downloadFile(record)}
									/>
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
