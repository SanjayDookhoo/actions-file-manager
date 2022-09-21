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
import { newFolderNameDefault } from './utils/constants';
import { getFolderId, update } from './utils/utils';

const SharingLinks = ({ sharingLinksIsOpen }) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		newFolderName,
		setSharingLinksIsOpen,
	} = useContext(FileExplorerContext);
	const [data, setData] = useState({});

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
			setData(res.data);
		});
	}, [sharingLinksIsOpen]);

	const copyLink = (accessType) => {
		const temp = data.meta.sharingPermission.sharingPermissionLinks.find(
			(record) => record.accessType == accessType
		);
		const actualLink = window.location.href + `?link=${temp.link}`;
		navigator.clipboard.writeText(actualLink);
	};

	const refreshLink = (accessType) => {
		const temp = data.meta.sharingPermission.sharingPermissionLinks.find(
			(record) => record.accessType == accessType
		);
		const { id } = temp;

		axiosClientJSON({
			url: '/refreshSharingLink',
			method: 'POST',
			data: {
				id,
			},
		}).then((res) => {
			const { link } = res.data.returning[0];

			let tempSharingPermissionLinks = [
				...data.meta.sharingPermission.sharingPermissionLinks,
			];
			const index = tempSharingPermissionLinks.findIndex(
				(record) => record.id == id
			);
			tempSharingPermissionLinks.splice(index, 1);
			tempSharingPermissionLinks = [
				...tempSharingPermissionLinks,
				{
					...temp,
					link,
				},
			];

			setData(
				update(data, {
					meta: {
						sharingPermission: {
							sharingPermissionLinks: {
								$set: tempSharingPermissionLinks,
							},
						},
					},
				})
			);
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
				<div>
					<div>View Access: </div>
					<button onClick={() => copyLink('VIEW')}>Copy Link</button>
					<button onClick={() => refreshLink('VIEW')}>Refresh</button>
				</div>
				<div>
					<div>Edit Access: </div>
					<button onClick={() => copyLink('EDIT')}>Copy Link</button>
					<button onClick={() => refreshLink('VIEW')}>Refresh</button>
				</div>
				<div className="flex justify-end p-4">
					<button onClick={handleClose}>Done</button>
				</div>
			</div>
		</div>
	);
};

export default SharingLinks;
