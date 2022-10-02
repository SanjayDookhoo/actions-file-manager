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
import { buttonStyle } from './utils/constants';

const SharingLinks = ({ id, __typename }) => {
	const { setModal } = useContext(FileExplorerContext);
	const [data, setData] = useState([]);
	const [confirmRefreshId, setConfirmRefreshId] = useState(null);

	const handleClose = (e) => {
		setModal(null);
	};

	useEffect(() => {
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
	}, [id, __typename]);

	const copyLink = (link) => {
		const actualLink = window.location.href + `?link=${link}`;
		navigator.clipboard.writeText(actualLink);
	};

	const confirmedRefreshLink = (id) => {
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
			setConfirmRefreshId(null);
		});
	};

	const refreshLink = (id) => {
		if (id != confirmRefreshId) {
			setConfirmRefreshId(id);
		} else {
			confirmedRefreshLink(id);
		}
	};

	return (
		<div
			className="w-64 h-44 bg-gray-500 rounded-lg flex flex-col"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="p-2 px-4">Share "{data.name}"</div>
			{data
				.sort((a, b) => b.accessType.localeCompare(a.accessType)) // keeps it in order after a link is refreshed, since the order the info is retrieved in from the database, default, is last updated
				.map((record) => (
					<div key={record.id}>
						<div>{record.accessType == 'EDIT' ? 'Edit' : 'View'} Access: </div>
						<button onClick={() => copyLink(record.link)}>Copy Link</button>
						<button onClick={() => refreshLink(record.id)}>
							{confirmRefreshId == record.id ? 'Confirm refresh' : 'Refresh'}
						</button>
						{confirmRefreshId == record.id && (
							<div className="flex items-center">
								<span className={buttonStyle}>warning</span>
								Are you sure you would like to refresh link? the link will need
								to reshared with anyone that previously had access.
							</div>
						)}
					</div>
				))}
			<div className="flex justify-end p-4">
				<button onClick={handleClose}>Done</button>
			</div>
		</div>
	);
};

export default SharingLinks;
