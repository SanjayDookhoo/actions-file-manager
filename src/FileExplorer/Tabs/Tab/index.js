import { useEffect, useState } from 'react';
import { button_style } from '../../utils/constants';
import { tab_max_width, tab_min_width } from '../constants';

const icon = 'folder';
const folder_name = 'folder name';

const Tab = (props) => {
	const { tab_width, tabs_state, setTabsState, tab_index, inContextMenu } =
		props;
	const [width, setWidth] = useState(tab_max_width);

	useEffect(() => {
		if (tab_width) {
			if (tab_width > tab_max_width) {
				setWidth(tab_max_width);
			} else if (tab_width < tab_min_width) {
				setWidth(tab_min_width);
			} else {
				setWidth(tab_width);
			}
		} else {
			setWidth('100%');
		}
	}, [tab_width]);

	const handleClose = (e) => {
		if (inContextMenu) {
			e.stopPropagation(); // used in context menu
		}
		const temp_tabs_state = [...tabs_state];
		temp_tabs_state.splice(tab_index, 1);
		setTabsState(temp_tabs_state);
	};

	return (
		<div className={inContextMenu ? 'pb-1' : 'pr-1 pt-1'} style={{ width }}>
			{/* a extra padding container used here instead of margin, because that margin is not tied to the width like padding is */}
			<div
				className={
					'p-1 h-8 flex justify-between items-center bg-gray-300 ' +
					(inContextMenu ? 'rounded-lg' : 'rounded-tl-lg rounded-tr-lg')
				}
			>
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
				{tabs_state.length != 1 && (
					<a className="" onClick={handleClose}>
						<span className={button_style}>close</span>
					</a>
				)}
			</div>
		</div>
	);
};

export default Tab;
