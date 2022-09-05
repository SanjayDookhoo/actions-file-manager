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

const DirectoryViewOptions = () => {
	return (
		<div className="w-full flex justify-between">
			<div className="flex">
				<a className="flex items-center" title="cut">
					<span className={buttonStyle}>add</span>
					New
				</a>
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
