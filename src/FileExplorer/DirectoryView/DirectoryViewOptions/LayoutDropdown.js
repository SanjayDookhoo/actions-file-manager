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

const LayoutDropdown = () => {
	const { localStorage, setLocalStorage } = useContext(FileExplorerContext);
	const [layout, setLayout] = useState('details');

	return (
		<Menu
			menuButton={
				<a title="Sort">
					<span className={buttonStyle}>grid_view</span>
				</a>
			}
		>
			<MenuRadioGroup
				value={localStorage.layout}
				onRadioChange={(e) =>
					setLocalStorage({ ...localStorage, layout: e.value })
				}
			>
				<FileMenuItem description="Details" type="radio" value="details" />
				<FileMenuItem description="Tiles" type="radio" value="tiles" />
				<FileMenuItem
					description="Small Icons"
					type="radio"
					value="smallIcons"
				/>
				<FileMenuItem
					description="Medium Icons"
					type="radio"
					value="mediumIcons"
				/>
				<FileMenuItem
					description="Large Icons"
					type="radio"
					value="largeIcons"
				/>
			</MenuRadioGroup>

			<MenuDivider />

			<FileMenuItem
				description="Show hidden items"
				type="checkbox"
				checked={localStorage.showHiddenItems}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, showHiddenItems: e.checked })
				}
			/>
			<FileMenuItem
				description="Show file extensions"
				type="checkbox"
				checked={localStorage.showFileExtensions}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, showFileExtensions: e.checked })
				}
			/>
			<FileMenuItem
				description="Show details pane"
				type="checkbox"
				checked={localStorage.showDetailsPane}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, showDetailsPane: e.checked })
				}
			/>
		</Menu>
	);
};

export default LayoutDropdown;
