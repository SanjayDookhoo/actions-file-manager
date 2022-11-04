import { useContext, useEffect, useState } from 'react';
import { FileManagerContext } from '../../FileManager';
import useSubscription from '../../useSubscription';
import { buttonStyle } from '../../utils/constants';
import { formatBytes } from '../../utils/utils';

const AvailableSpaceDisplay = () => {
	const { axiosClientJSON } = useContext(FileManagerContext);
	const [used, setUsed] = useState(0);
	const [total, setTotal] = useState(0);

	const [data, dataLoading, error] = useSubscription('Home', 'folder', 'size');

	useEffect(() => {
		if (data) {
			const { size = 0, trashSize = 0 } = data.data.folder?.[0] ?? {};
			setUsed(size + trashSize);
		}
	}, [data]);

	useEffect(() => {
		axiosClientJSON({
			url: '/getTotalSize',
			method: 'POST',
		}).then((res) => {
			setTotal(res.data?.size);
		});
	}, []);

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
								className="bg-conditional-color h-full rounded"
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
