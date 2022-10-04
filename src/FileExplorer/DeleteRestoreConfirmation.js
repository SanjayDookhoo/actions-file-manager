import { useEffect } from 'react';
import { useState } from 'react';
import { axiosClientJSON } from './endpoint';
import { update } from './utils/utils';
import { toast } from 'react-toastify';

const DeleteRestoreConfirmation = ({
	type,
	data,
	setTabsState,
	tabsState,
	activeTabId,
	handleClose,
}) => {
	const [message, setMessage] = useState('');

	useEffect(() => {
		const { all, selectedFiles, selectedFolders } = data;
		const operation = type == 'restore' ? 'restore' : 'permanently delete';
		if (all) {
			setMessage(
				`Are you sure you want to ${operation} all the items from the recycle bin?`
			);
		} else {
			const count = selectedFiles.length + selectedFolders.length;
			setMessage(
				`Are you sure you want to ${operation}: ${count} item${
					count != 1 ? 's' : ''
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
			if (path[0] == 'Recycle bin') {
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
			type == 'restore' ? 'Restoring' : 'Permanently deleting';
		const operationSuccess =
			type == 'restore' ? 'Restored' : 'Permanently deleted';
		const operationError = type == 'restore' ? 'restore' : 'permanently delete';

		if (all) {
			toast.promise(res, {
				pending: `${operationPending} all`,
				success: `${operationSuccess} all`,
				error: `${operationError} all`,
			});
		} else {
			const count = selectedFiles.length + selectedFolders.length;
			const str = `${count} item${count != 1 ? 's' : ''}`;
			toast.promise(res, {
				pending: `${operationPending} ${str}`,
				success: `${operationSuccess} ${str}`,
				error: `${operationError} ${str}`,
			});
		}
	};

	return (
		<div>
			{message}
			<div className="flex justify-end p-4">
				<button onClick={handleConfirm}>Confirm</button>
				<button onClick={handleClose}>Cancel</button>
			</div>
		</div>
	);
};

export default DeleteRestoreConfirmation;
