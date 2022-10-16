import { useEffect, useState } from 'react';
import { backendEndpointWS } from './endpoint';
import useWebSocket from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';

const useSubscription = (folderId, __typename) => {
	const { sendMessage, lastMessage } = useWebSocket(backendEndpointWS, {
		shouldReconnect: (closeEvent) => true,
	});
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (folderId) {
			setLoading(true);
			const id = uuidv4();
			const token = window.localStorage.getItem('token');
			sendMessage(JSON.stringify({ __typename, folderId, id, token }));
			// console.log({ __typename, folderId, id });
		}
	}, [__typename, folderId]);

	useEffect(() => {
		if (lastMessage) {
			const { status, data, accessType } = JSON.parse(lastMessage.data);
			if (status == 200) {
				setData({ data, accessType });
				setError(false);
			} else {
				setError(true);
			}
			setLoading(false);
		}
	}, [lastMessage]);

	return [data, loading, error];
};

export default useSubscription;
