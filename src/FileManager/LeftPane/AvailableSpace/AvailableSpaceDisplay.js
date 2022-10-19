import { buttonStyle } from '../../utils/constants';

const AvailableSpaceDisplay = () => {
	const available = '3.63 GB';
	const total = '15 GB';
	return (
		<div className="flex items-center">
			<span className={buttonStyle}>cloud</span>
			<div>
				<div className="w-full h-2 rounded" style={{ backgroundColor: '#aaa' }}>
					<div
						className="bg-blue-300 h-full rounded"
						style={{ width: '20%' }}
					></div>
				</div>
				<div className="text-sm">
					{available} of {total} used
				</div>
			</div>
		</div>
	);
};

export default AvailableSpaceDisplay;
