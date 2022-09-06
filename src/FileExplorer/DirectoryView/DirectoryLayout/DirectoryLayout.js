import { useEffect, useState } from 'react';
import {
	ControlledMenu,
	FocusableItem,
	MenuDivider,
	MenuItem,
	useMenuState,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { buttonStyle } from '../../utils/constants';
import FileFocusableItem from '../../CustomReactMenu/FileFocusableItem';

const initialVisibleColumns = {
	name: true,
	dateCreated: true,
	dateModified: true,
	type: true,
	size: true,
};

const DirectoryLayout = () => {
	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [contextMenuOf, setContextMenuOf] = useState(null);

	const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

	const handleOnContextMenu = (e) => {
		let target = e.target;
		while (
			!target.classList.contains('fileExplorer') &&
			!target.classList.contains('directoryLayoutDetailsHeader') &&
			!target.classList.contains('directoryLayoutFolder') &&
			!target.classList.contains('directoryLayoutFile')
		) {
			target = target.parentElement;
		}
		if (target.classList.contains('directoryLayoutDetailsHeader')) {
			setContextMenuOf('directoryLayoutDetailsHeader');
		} else if (target.classList.contains('directoryLayoutFolder')) {
			setContextMenuOf('directoryLayoutFolder');
		} else if (target.classList.contains('directoryLayoutFile')) {
			setContextMenuOf('directoryLayoutFile');
		} else {
			setContextMenuOf('directoryLayoutEmptySpace');
		}

		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
	};

	return (
		<div className="w-full" onContextMenu={handleOnContextMenu}>
			<table>
				<tr className="directoryLayoutDetailsHeader">
					<th>Name</th>
					<th>Date Modified</th>
					<th>Type</th>
					<th>Size</th>
				</tr>
				<tr className="directoryLayoutFolder">
					<td>folder</td>
					<td>a</td>
					<td>b</td>
					<td>c</td>
				</tr>
				<tr className="directoryLayoutFile">
					<td>file</td>
					<td>a</td>
					<td>b</td>
					<td>c</td>
				</tr>
			</table>

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<div className="w-64">
					{contextMenuOf == 'directoryLayoutDetailsHeader' && (
						<>
							<FileMenuItem
								controlledStatePadding={true}
								description="Size all columns to fit"
							/>
							<MenuDivider />
							{Object.entries(visibleColumns).map(([column, value]) => (
								<FileMenuItem
									type="checkbox"
									checked={value}
									onClick={(e) =>
										setVisibleColumns({
											...visibleColumns,
											[column]: e.checked,
										})
									}
									description={column}
								/>
							))}
						</>
					)}
					{contextMenuOf == 'directoryLayoutFolder' && (
						<>
							<FileFocusableItem title="cut" icon="cut" />
							<FileFocusableItem title="copy" icon="content_copy" />
							<FileFocusableItem title="paste" icon="content_paste" />
							<FileFocusableItem
								title="share"
								icon="drive_file_rename_outline"
							/>
							<FileFocusableItem title="delete" icon="delete" />
							<MenuDivider />
							<FileMenuItem description="Open in new tab" />
							<FileMenuItem description="Add to favorites" />
						</>
					)}
					{contextMenuOf == 'directoryLayoutFile' && (
						<>
							<FileFocusableItem title="cut" icon="cut" />
							<FileFocusableItem title="copy" icon="content_copy" />
							<FileFocusableItem title="paste" icon="content_paste" />
							<FileFocusableItem
								title="share"
								icon="drive_file_rename_outline"
							/>
							<FileFocusableItem title="delete" icon="delete" />
							<MenuDivider />
							<FileMenuItem description="Create folder with selection" />
						</>
					)}

					{contextMenuOf == 'directoryLayoutEmptySpace' && <></>}
				</div>
			</ControlledMenu>
		</div>
	);
};

export default DirectoryLayout;
