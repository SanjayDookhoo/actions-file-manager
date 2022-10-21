import { useContext, useEffect, useState } from 'react';
import {
	capitalizeFirstLetter,
	formatBytes,
	update,
} from '../../../../../utils/utils';
import { FileManagerContext } from '../../../../../FileManager';
import DetailsLayout from './DetailsLayout';
import TilesLayout from './TilesLayout';
import IconsLayout from './IconsLayout';

const Layout = ({ record }) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		fileExtensionsMap,
		renderName,
		chooseColor,
		color,
	} = useContext(FileManagerContext);

	const renderDate = (record, dateField) => {
		const date = record.meta?.[dateField];
		if (!date) return '';
		return new Date(date).toLocaleString('en-US');
	};

	const renderType = (record) => {
		if (record.__typename == 'folder') {
			return 'File folder';
		} else {
			const ext = (record.name ?? '').split('.').pop();
			let fullName = fileExtensionsMap?.[ext]?.fullName;
			return fullName ? fullName : ext.toUpperCase() + ' file';
		}
	};

	const renderSize = (record) => {
		if (record.__typename == 'folder') {
			return '';
		} else {
			return formatBytes(record.size);
		}
	};

	const recordIsSelected = (record) => {
		const { __typename, id } = record;
		if (!__typename) {
			return false;
		} else {
			return tabsState[activeTabId][
				`selected${capitalizeFirstLetter(__typename)}s`
			].includes(id);
		}
	};

	const props = {
		record,
		renderDate,
		renderType,
		renderSize,
		recordIsSelected,
	};

	return (
		<div
			className={
				'hover ' + (recordIsSelected(record) ? 'bg-conditional-color' : '')
			}
			title={renderName(record)}
		>
			{localStorage.layout == 'details' && <DetailsLayout {...props} />}
			{localStorage.layout == 'tiles' && <TilesLayout {...props} />}
			{localStorage.layout.includes('Icons') && <IconsLayout {...props} />}
		</div>
	);
};

export default Layout;
