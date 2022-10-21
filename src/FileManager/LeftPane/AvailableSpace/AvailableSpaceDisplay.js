import { useEffect, useState } from 'react';
import useSubscription from '../../useSubscription';
import { buttonStyle } from '../../utils/constants';
import { formatBytes } from '../../utils/utils';

const AvailableSpaceDisplay = () => {
	const [used, setUsed] = useState(0);
	const total = 36127032;

	const [data, dataLoading, error] = useSubscription('Home', 'folder', 'size');

	useEffect(() => {
		if (data) {
			const { size, trashSize } = data.data.folder[0];
			setUsed(size + trashSize);
		}
	}, [data]);

	return (
		<>
			{!dataLoading && (
				<div className="flex items-center">
					<span className={buttonStyle}>cloud</span>
					<div>
						<div
							className="w-full h-2 rounded"
							style={{ backgroundColor: '#aaa' }}
						>
							<div
								className="bg-blue-300 h-full rounded"
								style={{ width: `${Math.min((used / total) * 100, 100)}%` }} // Math.min used in the event that the percentage ever exceeds 100 for whatever reason
							></div>
						</div>
						<div className="text-sm">
							{formatBytes(used)} of {formatBytes(total)} used
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AvailableSpaceDisplay;
