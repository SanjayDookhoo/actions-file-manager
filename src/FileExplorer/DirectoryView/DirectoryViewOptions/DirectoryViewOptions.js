import { useContext, useEffect, useState } from 'react';
import FilesOptions from '../../FilesOptions/FilesOptions';
import { buttonStyle, layoutOptions } from '../../utils/constants';
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
import GroupDropdown from './GroupDropdown';
import FilterContext from './FilterContext';
import { useHotkeys } from 'react-hotkeys-hook';
import { FileExplorerContext } from '../../FileExplorer';

const DirectoryViewOptions = () => {
	const { localStorage, setLocalStorage } = useContext(FileExplorerContext);

	// hot keys needed to be placed here because the menu does not mount originally until first opened
	useHotkeys('ctrl+shift+1', () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[0] })
	);
	useHotkeys('ctrl+shift+2', () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[1] })
	);
	useHotkeys('ctrl+shift+3', () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[2] })
	);
	useHotkeys('ctrl+shift+4', () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[3] })
	);
	useHotkeys('ctrl+shift+5', () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[4] })
	);

	return (
		<div className="w-full flex justify-between">
			<div className="flex">
				<NewDropdown />
				<FilesOptions />
			</div>
			<div className="flex">
				<SelectionDropdown />
				<FilterContext />
				<Menu
					menuButton={
						<a title="Sort">
							<span className={buttonStyle}>swap_vert</span>
						</a>
					}
				>
					<SortDropdown />
				</Menu>
				<Menu
					menuButton={
						<a title="Group">
							<span className={buttonStyle}>dvr</span>
						</a>
					}
				>
					<GroupDropdown />
				</Menu>
				<Menu
					menuButton={
						<a title="Layout">
							<span className={buttonStyle}>grid_view</span>
						</a>
					}
				>
					<LayoutDropdown />
				</Menu>
			</div>
		</div>
	);
};

export default DirectoryViewOptions;
