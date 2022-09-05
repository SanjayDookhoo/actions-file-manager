import { MenuItem } from '@szhsin/react-menu';
import { buttonStyle } from '../utils/constants';

const newButtonStyle =
	'material-symbols-outlined w-8 h-9 pr-1 flex justify-start items-center rounded-lg ';

// creates layout for component to be placed in MenuItem
// adjust shortcutHint position to be placed better based on the expected placement of FileSubMenu arrow
const FileMenuItem = (props) => {
	const {
		logo,
		description,
		shortcutHint,
		controlledStatePadding,
		...otherProps
	} = props;
	return (
		<MenuItem {...otherProps}>
			<div className="flex justify-between items-center w-full">
				<div className="flex justify-start items-center">
					{controlledStatePadding && <div className="w-3"> &nbsp; </div>}
					{(logo || logo === false) && (
						<span className={newButtonStyle}>{logo}</span>
					)}
					<div>{description}</div>
				</div>
				{shortcutHint && (
					<div className="pl-4 text-xs relative left-3">{shortcutHint}</div>
				)}
			</div>
		</MenuItem>
	);
};

export default FileMenuItem;
