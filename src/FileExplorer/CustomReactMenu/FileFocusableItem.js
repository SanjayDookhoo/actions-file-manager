import { FocusableItem } from '@szhsin/react-menu';
import { buttonStyle } from '../utils/constants';

const FileFocusableItem = (props) => {
	const { icon, title, onClick } = props;
	return (
		<FocusableItem>
			{({ ref }) => (
				<a ref={ref} className="inline-block" title={title} onClick={onClick}>
					<span className={buttonStyle}>{icon}</span>
				</a>
			)}
		</FocusableItem>
	);
};

export default FileFocusableItem;
