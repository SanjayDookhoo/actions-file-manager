import { FocusableItem } from '@szhsin/react-menu';
import { buttonStyle } from '../utils/constants';

const FileFocusableItem = (props) => {
	const { icon, title, onClick } = props;

	const handleOnClick = (e, closeMenu) => {
		onClick(e);
		closeMenu();
	};

	return (
		<FocusableItem>
			{({ ref, closeMenu }) => (
				<a
					ref={ref}
					className="inline-block rounded hover"
					title={title}
					onClick={(e) => handleOnClick(e, closeMenu)}
				>
					<span className={buttonStyle}>{icon}</span>
				</a>
			)}
		</FocusableItem>
	);
};

export default FileFocusableItem;
