import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../../FileExplorer';
import { formatBytes } from '../../utils/utils';

const className = 'px-2';
const Footer = ({ folders, files }) => {
	const { tabsState, activeTabId } = useContext(FileExplorerContext);
	const [countSelected, setCountSelected] = useState(0);
	const [totalSize, setTotalSize] = useState(null);

	useEffect(() => {
		const { selectedFiles, selectedFolders } = tabsState[activeTabId];
		setCountSelected(selectedFiles.length + selectedFolders.length);

		if (selectedFolders.length > 0) {
			setTotalSize(null);
		} else {
			let size = 0;
			selectedFiles.forEach((selectedFile) => {
				size += files.find((file) => file.id == selectedFile).size;
			});
			setTotalSize(formatBytes(size));
		}
	}, [tabsState, activeTabId]);

	return (
		<div className="flex">
			<div className={className}>{folders.length + files.length} items</div>
			{countSelected != 0 && (
				<>
					<div className={className}>
						{countSelected} {countSelected == 1 ? 'item' : 'items'} selected
					</div>
					{totalSize && <div className={className}>{totalSize}</div>}
				</>
			)}
		</div>
	);
};

export default Footer;
