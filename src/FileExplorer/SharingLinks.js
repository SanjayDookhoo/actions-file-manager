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
import { toast } from 'react-toastify';
import Button from './Button';

const SharingLinks = ({ record }) => {
	const { id, __typename } = record;
	const { setModal, renderName } = useContext(FileExplorerContext);
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

		toast.success('Copied link');
	};

	const confirmedRefreshLink = (id) => {
		const res = axiosClientJSON({
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

		toast.promise(res, {
			pending: `Refreshing link`,
			success: `Refreshed link (Copied to clipboard)`,
			error: `Failed to refresh link`,
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
			className="h-fit bg-gray-500 rounded-lg flex flex-col p-2"
			style={{ width: '501px' }}
			onClick={(e) => e.stopPropagation()}
		>
			<div className="text-2xl">Share "{renderName(record)}"</div>
			{data
				.sort((a, b) => b.accessType.localeCompare(a.accessType)) // keeps it in order after a link is refreshed, since the order the info is retrieved in from the database, default, is last updated
				.map((record) => (
					<>
						<div key={record.id} className="flex my-1">
							<div className="flex items-center rounded-l-full rounded-r-lg w-32 bg-gray-200 ">
								<span className={buttonStyle}>
									{record.accessType == 'EDIT' ? 'edit' : 'visibility'}
								</span>
								<div>
									{record.accessType == 'EDIT' ? 'Edit' : 'View'} Access
								</div>
							</div>
							<div className="flex grow">
								<Button className="ml-2" onClick={() => copyLink(record.link)}>
									Copy Link
								</Button>
								{confirmRefreshId != record.id ? (
									<Button
										className="ml-2"
										onClick={() => refreshLink(record.id)}
									>
										Refresh
									</Button>
								) : (
									<>
										<Button
											className="ml-2"
											onClick={() => setConfirmRefreshId(null)}
										>
											Cancel refresh
										</Button>
										<Button
											className="ml-2"
											onClick={() => copyLink(record.link)}
										>
											Confirm refresh
										</Button>
									</>
								)}
							</div>
						</div>
						{confirmRefreshId == record.id && (
							<div className="flex items-center">
								<span className={buttonStyle}>warning</span>
								<div className="pl-2">
									Are you sure you would like to refresh link? the link will
									need to reshared with anyone that previously had access.
								</div>
							</div>
						)}
					</>
				))}
			<div className="flex justify-end">
				<Button onClick={handleClose}>Done</Button>
			</div>
		</div>
	);
};

export default SharingLinks;
