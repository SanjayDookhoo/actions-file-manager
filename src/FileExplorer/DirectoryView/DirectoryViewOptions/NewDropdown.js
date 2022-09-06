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

const NewDropdown = () => {
	return (
		<Menu
			menuButton={
				<a className="flex items-center" title="cut">
					<span className={buttonStyle}>add</span>
					New
				</a>
			}
		>
			<FileMenuItem logo="folder" description="Upload file" />
			<FileMenuItem logo="folder" description="Upload folder" />
			<MenuDivider />
			<FileMenuItem logo="folder" description="New folder" />
		</Menu>
	);
};

export default NewDropdown;
