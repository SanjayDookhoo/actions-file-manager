import { useEffect, useState } from 'react';
import FilesOptions from '../../FilesOptions/FilesOptions';
import { buttonStyle } from '../../utils/constants';
import {
	Menu,
	MenuItem,
	FocusableItem,
	SubMenu,
	MenuRadioGroup,
	MenuDivider,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import FileSubMenu from '../../CustomReactMenu/FileSubMenu';
import SortDropdown from './SortDropdown';
import SelectionDropdown from './SelectionDropdown';
import LayoutDropdown from './LayoutDropdown';
import NewDropdown from './NewDropdown';

const DirectoryViewOptions = () => {
	return (
		<div className="w-full flex justify-between">
			<div className="flex">
				<NewDropdown />
				<FilesOptions />
			</div>
			<div className="flex">
				<SelectionDropdown />
				<SortDropdown />
				<LayoutDropdown />
			</div>
		</div>
	);
};

export default DirectoryViewOptions;
