import { data } from 'autoprefixer';
import {
	useContext,
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { axiosClientJSON } from './endpoint';
import { FileExplorerContext } from './FileExplorer';

const SharingLinks = ({ sharingLinksIsOpen }) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		newFolderName,
		setSharingLinksIsOpen,
	} = useContext(FileExplorerContext);
	const [data, setData] = useState([]);

	const handleClose = (e) => {
		setSharingLinksIsOpen(false);
	};

	useEffect(() => {
		const { id, __typename } = sharingLinksIsOpen;
		axiosClientJSON({
			url: '/getSharingLinks',
			method: 'POST',
			data: {
				id,
				__typename,
			},
		}).then((res) => {
			console.log(res.data);
			setData(res.data);
		});
	}, [sharingLinksIsOpen]);

	const copyLink = (link) => {
		const actualLink = window.location.href + `?link=${link}`;
		navigator.clipboard.writeText(actualLink);
	};

	const refreshLink = (id) => {
		axiosClientJSON({
			url: '/refreshSharingLink',
			method: 'POST',
			data: {
				id,
			},
		}).then((res) => {
			const { link } = res.data.returning[0];

			let tempData = [...data];
			const index = tempData.findIndex((record) => record.id == id);
			const newRecord = {
				...tempData[index],
				link,
			};
			tempData.splice(index, 1);
			tempData = [...tempData, newRecord];

			setData(tempData);
			copyLink(link);
		});
	};

	return (
		<div
			className="absolute left-0 top-0 w-full h-full flex justify-center items-center z-10"
			onClick={handleClose}
		>
			<div
				className="w-64 h-44 bg-gray-500 rounded-lg flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-2 px-4">Share "{data.name}"</div>
				{data.map((record) => (
					<div key={record.id}>
						<div>{record.accessType == 'EDIT' ? 'Edit' : 'View'} Access: </div>
						<button onClick={() => copyLink(record.link)}>Copy Link</button>
						<button onClick={() => refreshLink(record.id)}>Refresh</button>
					</div>
				))}
				<div className="flex justify-end p-4">
					<button onClick={handleClose}>Done</button>
				</div>
			</div>
		</div>
	);
};

export default SharingLinks;
