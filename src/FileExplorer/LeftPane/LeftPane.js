import { useEffect, useState } from 'react';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import FileMenuItem from '../CustomReactMenu/FileMenuItem';
import NavigationIconAndName from '../NavigationIconAndName';

const LeftPane = () => {
	const [favoritesIsOpen, setFavoritesIsOpen] = useState(true);
	const [favorites, setFavorites] = useState(['a', 'b']);

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [contextMenuActive, setContextMenuActive] = useState(null);

	const handleOnContextMenu = (e, contextMenu) => {
		e.preventDefault();
		setAnchorPoint({ x: e.clientX, y: e.clientY });
		toggleMenu(true);
		setContextMenuActive(contextMenu);
	};

	return (
		<div className="flex flex-col items-start" style={{ width: '250px' }}>
			<button onContextMenu={(e) => handleOnContextMenu(e, 'Home')}>
				<NavigationIconAndName folderId="Home" />
			</button>
			<button onClick={() => setFavoritesIsOpen(!favoritesIsOpen)}>
				<NavigationIconAndName folderId="Favorites" />
			</button>
			{favoritesIsOpen &&
				favorites.map((favorite) => (
					<div
						className="pl-6"
						onContextMenu={(e) => handleOnContextMenu(e, 'favorite')}
						key={favorite}
					>
						<NavigationIconAndName folderId="22" />
					</div>
				))}
			<button onContextMenu={(e) => handleOnContextMenu(e, 'shared')}>
				<NavigationIconAndName folderId="Shared with me" />
			</button>
			<button onContextMenu={(e) => handleOnContextMenu(e, 'recycleBin')}>
				<NavigationIconAndName folderId="Recycle bin" />
			</button>

			<ControlledMenu
				{...menuProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<FileMenuItem logo="folder" description="Open in new tab" />
				{contextMenuActive == 'favorite' && (
					<>
						<FileMenuItem logo={false} description="Unpin from favorites" />
					</>
				)}
				{contextMenuActive == 'shared' && <></>}
				{contextMenuActive == 'recycleBin' && (
					<>
						<FileMenuItem logo={false} description="Empty recycle bin" />
					</>
				)}
			</ControlledMenu>
		</div>
	);
};

export default LeftPane;
