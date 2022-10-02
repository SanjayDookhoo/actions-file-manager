import { useEffect } from 'react';
import { useState } from 'react';
import { axiosClientJSON } from './endpoint';
import { update } from './utils/utils';

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
		axiosClientJSON({
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
