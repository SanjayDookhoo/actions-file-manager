import { useContext, useEffect, useState } from 'react';
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
import { FileExplorerContext } from '../../FileExplorer';

const SelectionDropdown = () => {
	const { localStorage, setLocalStorage } = useContext(FileExplorerContext);

	return (
		<Menu
			menuButton={
				<a title="Selection options">
					<span className={buttonStyle}>check_box</span>
				</a>
			}
		>
			<FileMenuItem
				description="Multiselect"
				type="checkbox"
				checked={localStorage.multiselect}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, multiselect: e.checked })
				}
			/>
			<MenuDivider />
			<FileMenuItem
				controlledStatePadding={true}
				logo="folder"
				description="Select All"
			/>
			<FileMenuItem
				controlledStatePadding={true}
				logo="folder"
				description="Invert Selection"
			/>
			<FileMenuItem
				controlledStatePadding={true}
				logo="folder"
				description="Clear Selection"
			/>
		</Menu>
	);
};

export default SelectionDropdown;
