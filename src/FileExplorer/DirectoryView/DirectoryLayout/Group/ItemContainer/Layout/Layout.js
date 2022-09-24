import { useContext, useEffect, useState } from 'react';
import {
	capitalizeFirstLetter,
	formatBytes,
	update,
} from '../../../../../utils/utils';
import { FileExplorerContext } from '../../../../../FileExplorer';
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
	} = useContext(FileExplorerContext);

	const renderDate = (record, dateField) => {
		const date = record.meta?.[dateField];
		if (!date) return '';
		return new Date(date).toGMTString();
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

	const renderName = (record) => {
		const { name = '', __typename } = record;
		if (__typename == 'folder') {
			return name;
		}
		const nameSplit = name.split('.');
		// !localStorage.showFileExtensions && localStorage.showHiddenItems, this is because a hidden item starts with a dot(.), so the rest of the name should not be considered a extension
		if (
			localStorage.showFileExtensions ||
			(!localStorage.showFileExtensions &&
				localStorage.showHiddenItems &&
				!nameSplit[0])
		) {
			return name;
		} else {
			return nameSplit.slice(0, nameSplit.length - 1).join('.');
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
		renderName,
		renderSize,
		recordIsSelected,
	};

	return (
		<>
			{localStorage.layout == 'details' && <DetailsLayout {...props} />}
			{localStorage.layout == 'tiles' && <TilesLayout {...props} />}
			{localStorage.layout.includes('Icons') && <IconsLayout {...props} />}
		</>
	);
};

export default Layout;
