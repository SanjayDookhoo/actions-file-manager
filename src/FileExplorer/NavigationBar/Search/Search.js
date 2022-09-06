import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { buttonStyle } from '../../utils/constants';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';

const Search = () => {
	const [search, setSearch] = useState('');
	const inputRef = useRef();
	const searchContainerRef = useRef();

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

	const handleRenderSearchMenu = () => {
		const input = inputRef.current.getBoundingClientRect();
		setAnchorPoint({ x: input.left, y: input.bottom });
		toggleMenu(true);
	};

	const handleSearchOnClick = (event) => {
		inputRef.current.focus();
		if (search) {
			handleRenderSearchMenu();
		}
	};

	const handleSearchOnChange = (e) => {
		setSearch(e.target.value);
	};

	const clearText = (e) => {
		e.stopPropagation();
		setSearch('');
	};

	const openSearchInWindow = (e) => {
		e.stopPropagation();
		// TODO openSearchInWindow
	};

	useLayoutEffect(() => {
		if (search.length == 1) {
			handleRenderSearchMenu();
		} else if (search.length > 1) {
			// TODO: add items to context menu from search
		} else {
			toggleMenu(false);
		}
	}, [search]);

	const tooltipProps = {
		captureFocus: false, // does not switch focus to contextMenu while typing in input
	};

	// returns focus to input to receive key input while leaving the menu still open
	const handleOnKeyDown = (e) => {
		inputRef.current.focus();
		toggleMenu(true);
	};

	return (
		<div
			ref={searchContainerRef}
			className="w-64 px-2 flex align-center justify-between cursor-text"
			onClick={handleSearchOnClick}
		>
			<input
				ref={inputRef}
				className="bg-zinc-500"
				type="test"
				placeholder="Seach"
				value={search}
				onChange={handleSearchOnChange}
			/>
			<div className="flex align-center">
				{search && (
					<a onClick={clearText}>
						<span className={buttonStyle}>close</span>
					</a>
				)}
				<a onClick={openSearchInWindow}>
					<span className={buttonStyle}>search</span>
				</a>
			</div>

			<ControlledMenu
				{...menuProps}
				{...tooltipProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<div className="w-64">
					<FileMenuItem
						logo="folder"
						description="Test"
						onKeyDown={handleOnKeyDown}
					/>
				</div>
			</ControlledMenu>
		</div>
	);
};

export default Search;
