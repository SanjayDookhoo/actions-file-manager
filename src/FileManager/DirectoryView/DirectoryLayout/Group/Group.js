import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { update } from '../../../utils/utils';
import { FileManagerContext } from '../../../FileManager';
import Item from './ItemContainer/Item';
import { buttonStyle } from '../../../utils/constants';

const Group = ({
	groupIndex,
	groupName,
	items,
	files,
	folders,
	setFlexContainerWidth,
	...otherProps
}) => {
	const { tabsState, setTabsState, activeTabId, localStorage } =
		useContext(FileManagerContext);
	const [collapsed, setCollapsed] = useState(false);

	const flexContainerRef = useRef();

	const handleCollapsibleClick = (e) => {
		e.stopPropagation();
		setCollapsed(!collapsed);
	};

	const handleGroupSelectAll = (e) => {
		e.stopPropagation();
		const selectedFiles = items
			.filter((item) => item.__typename === 'file')
			.map((item) => item.id);
		const selectedFolders = items
			.filter((item) => item.__typename === 'folder')
			.map((item) => item.id);

		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					selectedFiles: { $set: selectedFiles },
					selectedFolders: { $set: selectedFolders },
				},
			})
		);
	};

	useLayoutEffect(() => {
		if (groupIndex === 0) {
			const flexContainer = flexContainerRef.current;
			const handleResizeObserver = () => {
				const width = flexContainer.offsetWidth;
				setFlexContainerWidth(width);
			};
			const observer = new ResizeObserver(handleResizeObserver);
			observer.observe(flexContainer);
			return () => {
				observer.unobserve(flexContainer);
			};
		}
	}, [groupIndex]);

	const itemProps = {
		...otherProps,
	};

	return (
		<>
			{groupName !== 'noneGrouping' && (
				<div
					className="flex items-center select-none hover"
					onClick={handleGroupSelectAll}
				>
					<div onClick={handleCollapsibleClick}>
						<span className={buttonStyle}>
							{!collapsed ? 'expand_more' : 'expand_less'}
						</span>
					</div>
					<div>
						{groupName} ({items.length})
					</div>
					<div className="ml-3 group-separator"></div>
				</div>
			)}
			<div
				className={
					'flex ' +
					(collapsed ? 'hidden ' : ' ') +
					(localStorage.layout === 'details' ? 'flex-col w-fit' : 'flex-wrap')
				}
				ref={flexContainerRef}
			>
				{items.map((item, index) => (
					<Item
						key={`${item.__typename}-${item.id}`}
						item={item}
						itemIndex={index}
						groupIndex={groupIndex}
						{...itemProps}
					/>
				))}
			</div>
		</>
	);
};

export default Group;
