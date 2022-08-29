import { useEffect, useState } from 'react';
import { buttonStyle } from '../../utils/constants';
import { tabMaxWidth, tabMinWidth } from '../constants';

const icon = 'folder';
const folderName = 'folder name';

const Tab = (props) => {
	const { tabWidth, tabsState, setTabsState, tabIndex, inContextMenu } = props;
	const [width, setWidth] = useState(tabMaxWidth);

	useEffect(() => {
		if (tabWidth) {
			if (tabWidth > tabMaxWidth) {
				setWidth(tabMaxWidth);
			} else if (tabWidth < tabMinWidth) {
				setWidth(tabMinWidth);
			} else {
				setWidth(tabWidth);
			}
		} else {
			setWidth('100%');
		}
	}, [tabWidth]);

	const handleClose = (e) => {
		if (inContextMenu) {
			e.stopPropagation(); // used in context menu
		}
		const tempTabsState = [...tabsState];
		tempTabsState.splice(tabIndex, 1);
		setTabsState(tempTabsState);
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
					<span className={buttonStyle}>{icon}</span>
					<p
						className="inline text-ellipsis overflow-hidden"
						style={{ height: '25px' }} // manually set so the folder name doesnt break up into multi line words. also spaced well with icons
					>
						{folderName}
					</p>
				</div>
				{tabsState.length != 1 && (
					<a className="" onClick={handleClose}>
						<span className={buttonStyle}>close</span>
					</a>
				)}
			</div>
		</div>
	);
};

export default Tab;
