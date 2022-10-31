import { Fragment, useContext, useEffect, useState } from 'react';
import { axiosClientJSON } from './endpoint';
import { FileManagerContext } from './FileManager';
import { buttonStyle } from './utils/constants';
import { toast } from 'react-toastify';
import Button from './Button';

const SharingLinks = ({ record }) => {
	const { id, __typename } = record;
	const { setModal, renderName } = useContext(FileManagerContext);
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
			const index = tempData.findIndex((record) => record.id === id);
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
		if (id !== confirmRefreshId) {
			setConfirmRefreshId(id);
		} else {
			confirmedRefreshLink(id);
		}
	};

	return (
		<div
			className="h-fit rounded-lg flex flex-col p-2 bg-shade-3"
			style={{
				width: '501px',
			}}
			onClick={(e) => e.stopPropagation()}
		>
			<div className="text-2xl">Share "{renderName(record)}"</div>
			{data
				.sort((a, b) => b.accessType.localeCompare(a.accessType)) // keeps it in order after a link is refreshed, since the order the info is retrieved in from the database, default, is last updated
				.map((record) => (
					<Fragment key={record.id}>
						<div className="flex my-1">
							<div className="flex items-center rounded-l-full rounded-r-lg w-32 bg-shade-4">
								<span className={buttonStyle}>
									{record.accessType === 'EDIT' ? 'edit' : 'visibility'}
								</span>
								<div>
									{record.accessType === 'EDIT' ? 'Edit' : 'View'} Access
								</div>
							</div>
							<div className="flex grow">
								<Button className="ml-2" onClick={() => copyLink(record.link)}>
									Copy Link
								</Button>
								{confirmRefreshId !== record.id ? (
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
											onClick={() => refreshLink(record.id)}
										>
											Confirm refresh
										</Button>
									</>
								)}
							</div>
						</div>
						{confirmRefreshId === record.id && (
							<div className="flex items-center py-6">
								<span className={buttonStyle}>warning</span>
								<div className="pl-2">
									Are you sure you would like to refresh link? the link will
									need to reshared with anyone that previously had access.
								</div>
							</div>
						)}
					</Fragment>
				))}
			<div className="flex justify-end">
				<Button onClick={handleClose}>Done</Button>
			</div>
		</div>
	);
};

export default SharingLinks;
