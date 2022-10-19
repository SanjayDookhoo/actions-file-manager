import { useContext } from 'react';
import { FileManagerContext } from '../FileManager';
import { buttonStyle } from '../utils/constants';
import AvailableSpaceDisplay from './AvailableSpace/AvailableSpaceDisplay';
import AvailableSpaceDisplayModal from './AvailableSpace/AvailableSpaceDisplayModal';

const AvailableSpace = () => {
	const { modal, setModal, breakpointClass } = useContext(FileManagerContext);

	const onClick = () => {
		setModal({
			isOpen: true,
			component: AvailableSpaceDisplayModal,
			componentProps: {
				// type: 'permanentlyDelete',
				// data: {
				// 	all: true,
				// },
				// setTabsState,
				// tabsState,
				// activeTabId,
			},
		});
	};

	return (
		<div className="ml-1">
			<a
				className={
					'hover ' +
					breakpointClass({
						md: 'hidden',
						default: 'inline-block',
					})
				}
				onClick={onClick}
			>
				<span className={buttonStyle}>cloud</span>
			</a>

			<div
				className={breakpointClass({
					md: 'block',
					default: 'hidden',
				})}
			>
				<AvailableSpaceDisplay />
			</div>
		</div>
	);
};

export default AvailableSpace;
