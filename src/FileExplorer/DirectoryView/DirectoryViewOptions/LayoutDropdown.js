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

const LayoutDropdown = () => {
	const [layout, setLayout] = useState('details');
	const [showHiddenItems, setShowHiddenItems] = useState(false);
	const [showFileExtensions, setShowFileExtensions] = useState(false);
	const [showDetailsPane, setShowDetailsPane] = useState(false);

	return (
		<Menu
			menuButton={
				<a title="Sort">
					<span className={buttonStyle}>grid_view</span>
				</a>
			}
		>
			<MenuRadioGroup value={layout} onRadioChange={(e) => setLayout(e.value)}>
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
				checked={showHiddenItems}
				onClick={(e) => setShowHiddenItems(e.checked)}
			/>
			<FileMenuItem
				description="Show file extensions"
				type="checkbox"
				checked={showFileExtensions}
				onClick={(e) => setShowFileExtensions(e.checked)}
			/>
			<FileMenuItem
				description="Show details pane"
				type="checkbox"
				checked={showDetailsPane}
				onClick={(e) => setShowDetailsPane(e.checked)}
			/>
		</Menu>
	);
};

export default LayoutDropdown;
