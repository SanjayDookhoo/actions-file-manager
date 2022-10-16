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
import FilterContext from './FilterContext/FilterContext';
import { useHotkeys } from 'react-hotkeys-hook';
import { FileManagerContext } from '../../FileManager';
import { canEdit, shortcutHotkeyGenerate } from '../../utils/utils';

const DirectoryViewOptions = () => {
	const {
		localStorage,
		setLocalStorage,
		tabsState,
		activeTabId,
		sharedAccessType,
	} = useContext(FileManagerContext);

	// hot keys needed to be placed here because the menu does not mount originally until first opened
	useHotkeys(shortcutHotkeyGenerate('ctrl+shift+1'), () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[0] })
	);
	useHotkeys(shortcutHotkeyGenerate('ctrl+shift+2'), () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[1] })
	);
	useHotkeys(shortcutHotkeyGenerate('ctrl+shift+3'), () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[2] })
	);
	useHotkeys(shortcutHotkeyGenerate('ctrl+shift+4'), () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[3] })
	);
	useHotkeys(shortcutHotkeyGenerate('ctrl+shift+5'), () =>
		setLocalStorage({ ...localStorage, layout: layoutOptions[4] })
	);

	return (
		<div className="w-full flex justify-between">
			<div className="flex">
				{canEdit({ tabsState, activeTabId, sharedAccessType }) && (
					<Menu
						menuButton={
							<a className="flex items-center hover" title="cut">
								<span className={buttonStyle}>add</span>
								<div className="">New</div>
								<span className="material-symbols-outlined text-sm px-1">
									expand_more
								</span>
							</a>
						}
					>
						<NewDropdown />
					</Menu>
				)}

				<FilesOptions />
			</div>
			<div className="flex pr-1">
				<SelectionDropdown />
				<FilterContext />
				<Menu
					menuButton={
						<a className="hover flex items-center" title="Sort">
							<span className={buttonStyle}>swap_vert</span>
							<span className="material-symbols-outlined text-sm relative -left-1">
								expand_more
							</span>
						</a>
					}
				>
					<SortDropdown />
				</Menu>
				<Menu
					menuButton={
						<a className="hover flex items-center" title="Group">
							<span className={buttonStyle}>dvr</span>
							<span className="material-symbols-outlined text-sm relative -left-1">
								expand_more
							</span>
						</a>
					}
				>
					<GroupDropdown />
				</Menu>
				<Menu
					menuButton={
						<a className="hover flex items-center" title="Layout">
							<span className={buttonStyle}>grid_view</span>
							<span className="material-symbols-outlined text-sm relative -left-1">
								expand_more
							</span>
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
