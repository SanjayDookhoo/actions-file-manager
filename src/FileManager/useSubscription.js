import { useContext, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
import { FileManagerContext } from './FileManager';

const useSubscription = (folderId, __typename, type) => {
	const { backendEndpointWS } = useContext(FileManagerContext);
	const { sendMessage, lastMessage, readyState } = useWebSocket(
		backendEndpointWS,
		{
			shouldReconnect: (closeEvent) => true,
		}
	);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (folderId && readyState === 1) {
			setLoading(true);
			const id = uuidv4();
			const token = window.localStorage.getItem('token');
			sendMessage(JSON.stringify({ __typename, folderId, id, token, type }));
			// console.log({ __typename, folderId, id });
		}
	}, [__typename, folderId, type, readyState]);

	useEffect(() => {
		if (lastMessage) {
			const { status, data, accessType } = JSON.parse(lastMessage.data);
			if (status === 200) {
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
