import { useContext, useEffect } from 'react';
import { useState } from 'react';
import { update } from './utils/utils';
import { toast } from 'react-toastify';
import Button from './Button';
import { FileManagerContext } from './FileManager';

const DeleteRestoreConfirmation = ({
	type,
	data,
	setTabsState,
	tabsState,
	activeTabId,
	handleClose,
}) => {
	const { axiosClientJSON } = useContext(FileManagerContext);
	const [message, setMessage] = useState('');

	useEffect(() => {
		const { all, selectedFiles, selectedFolders } = data;
		const operation = type === 'restore' ? 'restore' : 'permanently delete';
		if (all) {
			setMessage(
				`Are you sure you want to ${operation} all the items from the recycle bin?`
			);
		} else {
			const count = selectedFiles.length + selectedFolders.length;
			setMessage(
				`Are you sure you want to ${operation}: ${count} item${
					count !== 1 ? 's' : ''
				}?`
			);
		}
	}, [data]);

	const handleConfirm = () => {
		const res = axiosClientJSON({
			url: `/${type}`,
			method: 'POST',
			data,
		}).then((res) => {
			handleClose();

			// conditional, if in recycle bin currently
			const { path } = tabsState[activeTabId];
			if (path[0] === 'Recycle bin') {
				setTabsState(
					update(tabsState, {
						[activeTabId]: {
							selectedFiles: { $set: [] },
							selectedFolders: { $set: [] },
						},
					})
				);
			}
		});

		const { all, selectedFiles, selectedFolders } = data;
		const operationPending =
			type === 'restore' ? 'Restoring' : 'Permanently deleting';
		const operationSuccess =
			type === 'restore' ? 'Restored' : 'Permanently deleted';
		const operationError =
			type === 'restore' ? 'restore' : 'permanently delete';

		if (all) {
			toast.promise(res, {
				pending: `${operationPending} all`,
				success: `${operationSuccess} all`,
				error: `${operationError} all`,
			});
		} else {
			const count = selectedFiles.length + selectedFolders.length;
			const str = `${count} item${count !== 1 ? 's' : ''}`;
			toast.promise(res, {
				pending: `${operationPending} ${str}`,
				success: `${operationSuccess} ${str}`,
				error: `${operationError} ${str}`,
			});
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
			<div className="text-2xl">{message}</div>
			<div className="flex justify-end p-2">
				<Button className="ml-1" onClick={handleConfirm}>
					Confirm
				</Button>
				<Button className="ml-1" onClick={handleClose}>
					Cancel
				</Button>
			</div>
		</div>
	);
};

export default DeleteRestoreConfirmation;
