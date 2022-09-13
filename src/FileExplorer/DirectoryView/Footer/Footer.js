import { useContext, useEffect, useState } from 'react';
import { FileExplorerContext } from '../../FileExplorer';

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

	// useEffect()

	const formatBytes = (bytes, decimals = 2) => {
		if (!+bytes) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

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
