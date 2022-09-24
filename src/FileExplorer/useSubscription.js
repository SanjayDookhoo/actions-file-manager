import { useEffect, useState } from 'react';
import { backendEndpointWS } from './endpoint';
import useWebSocket from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';

const useSubscription = (args, subscriptionOf) => {
	const { sendMessage, lastMessage } = useWebSocket(backendEndpointWS);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (args) {
			setLoading(true);
			const id = uuidv4();
			const token = window.localStorage.getItem('token');
			sendMessage(JSON.stringify({ subscriptionOf, args, id, token }));
			console.log({ subscriptionOf, args, id });
		}
	}, [subscriptionOf, args]);

	useEffect(() => {
		if (lastMessage) {
			const { status, data } = JSON.parse(lastMessage.data);
			if (status == 200) {
				setData(data);
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
