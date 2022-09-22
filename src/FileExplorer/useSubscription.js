import { useEffect, useState } from 'react';
import { backendEndpointWS } from './endpoint';
import useWebSocket from 'react-use-websocket';

const useSubscription = (args, subscriptionOf) => {
	const { sendMessage, lastMessage } = useWebSocket(backendEndpointWS);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		setLoading(true);
		sendMessage(JSON.stringify({ subscriptionOf, args }));
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
