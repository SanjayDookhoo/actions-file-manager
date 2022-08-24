import { useEffect, useState } from 'react';
import { tab_max_width, tab_min_width } from '../constants';

const icon = 'folder';
const folder_name = 'folder name';

const Tab = (props) => {
	const { tab_width } = props;
	const [width, setWidth] = useState(tab_max_width);

	useEffect(() => {
		if (tab_width > tab_max_width) {
			setWidth(tab_max_width);
		} else if (tab_width < tab_min_width) {
			setWidth(tab_min_width);
		} else {
			setWidth(tab_width);
		}
	}, [tab_width]);

	const button_style = 'material-symbols-outlined p-1';

	return (
		<div className="p-1" style={{ width }}>
			{' '}
			{/* a extra padding container used here instead of margin, because that margin is not tied to the width like padding is */}
			<div className="p-1 h-8 flex justify-between items-center rounded-tl-lg rounded-tr-lg bg-gray-300">
				<div
					className="flex items-center"
					style={{ width: 'calc(100% - 32px)' }}
				>
					{' '}
					{/* the width calc minuses the size of the close button */}
					<span className={button_style}>{icon}</span>
					<p
						className="inline text-ellipsis overflow-hidden"
						style={{ height: '25px' }} // manually set so the folder name doesnt break up into multi line words. also spaced well with icons
					>
						{folder_name}
					</p>
				</div>
				<span className={button_style}>close</span>
			</div>
		</div>
	);
};

export default Tab;