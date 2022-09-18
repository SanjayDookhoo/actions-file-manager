import { useContext, useEffect, useState } from 'react';
import FileUploadDiv from '../../../../FileUploadDiv/FileUploadDiv';
import Layout from './Layout/Layout';
const Item = ({ item, getRecord, fileExtensionsMap }) => {
	const [record, setRecord] = useState({});

	useEffect(() => {
		setRecord(getRecord(item));
	}, [item]);

	const layoutProps = {
		record,
		fileExtensionsMap,
	};

	return (
		<>
			{record && (
				<>
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
				</>
			)}
		</>
	);
};

export default Item;
