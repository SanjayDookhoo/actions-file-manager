import { SubMenu } from '@szhsin/react-menu';

// creates layout of item to be placed in Label
// for some reasons the intended arrow of the creator of the package doesnt show, probably ties in with tailwind, make my own arrow
const FileSubMenu = (props) => {
	const { children, ...otherProps } = props;
	return <SubMenu label={<Label {...otherProps} />}>{children}</SubMenu>;
};

export default FileSubMenu;

const newButtonStyle =
	'material-symbols-outlined w-8 h-9 pr-1 flex justify-start items-center rounded-lg ';

const Label = (props) => {
	const { logo, description, controlledStatePadding } = props;
	return (
		<div className="flex justify-between items-center w-full">
			<div className="flex justify-start items-center">
				{controlledStatePadding && <div className="w-3"> &nbsp;</div>}
				{(logo || logo === false) && (
					<span className={newButtonStyle}>{logo}</span>
				)}
				<div>{description}</div>
			</div>
			{/* <span className={buttonStyle}>chevron_right</span> */}
		</div>
	);
};
