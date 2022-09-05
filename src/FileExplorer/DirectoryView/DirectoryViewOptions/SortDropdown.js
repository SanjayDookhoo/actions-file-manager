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

const SortDropdown = () => {
	const [sortOrder, setSortOrder] = useState('ascending');
	const [sortBy, setSortBy] = useState('name');
	const [groupBy, setGroupBy] = useState('none');
	return (
		<Menu
			menuButton={
				<a title="Layout">
					<span className={buttonStyle}>swap_vert</span>
				</a>
			}
		>
			<FileSubMenu controlledStatePadding={true} description="Sort By">
				<MenuRadioGroup
					value={sortBy}
					onRadioChange={(e) => setSortBy(e.value)}
				>
					<FileMenuItemGroup />
				</MenuRadioGroup>
			</FileSubMenu>
			<FileSubMenu controlledStatePadding={true} description="Group By">
				<MenuRadioGroup
					value={groupBy}
					onRadioChange={(e) => setGroupBy(e.value)}
				>
					<FileMenuItem description="None" type="radio" value="none" />
					<FileMenuItemGroup />
				</MenuRadioGroup>
			</FileSubMenu>

			<MenuDivider />
			<MenuRadioGroup
				value={sortOrder}
				onRadioChange={(e) => setSortOrder(e.value)}
			>
				<FileMenuItem description="Ascending" type="radio" value="ascending" />
				<FileMenuItem
					description="Descending"
					type="radio"
					value="descending"
				/>
			</MenuRadioGroup>
		</Menu>
	);
};

export default SortDropdown;

const FileMenuItemGroup = () => {
	return (
		<>
			<FileMenuItem description="Name" type="radio" value="name" />
			<FileMenuItem
				description="Date Modified"
				type="radio"
				value="dateModified"
			/>
			<FileMenuItem
				description="Date Created"
				type="radio"
				value="dateCreated"
			/>
			<FileMenuItem description="Size" type="radio" value="size" />
			<FileMenuItem description="Type" type="radio" value="type" />
		</>
	);
};
