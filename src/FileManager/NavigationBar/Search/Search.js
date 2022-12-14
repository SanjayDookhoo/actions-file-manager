import {
	Fragment,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { buttonStyle } from '../../utils/constants';
import { ControlledMenu, MenuDivider, useMenuState } from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { FileManagerContext } from '../../FileManager';
import { getFolderId, shortcutHotkeyGenerate, update } from '../../utils/utils';
import RenderIcon from '../../DirectoryView/DirectoryLayout/Group/ItemContainer/Layout/RenderIcon';
import { useHotkeys } from 'react-hotkeys-hook';
import useDebounce from '../../useDebounce';

const Search = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		fileExtensionsMap,
		rootUserFolderId,
		renderName,
		breakpointClass,
		axiosClientJSON,
	} = useContext(FileManagerContext);

	const [search, setSearch] = useState('');
	const [searching, setSearching] = useState(false);
	const inputRef = useRef();
	const searchContainerRef = useRef();

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [captureFocus, setCaptureFocus] = useState(false);

	const [searchResponse, setSearchResponse] = useState([]);

	const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);

	const debouncedSearch = useDebounce(search);

	useHotkeys(shortcutHotkeyGenerate('ctrl+f'), (e) => {
		e.preventDefault();
		inputRef.current.focus();
	});

	useEffect(() => {
		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		if (debouncedSearch) {
			setSearching(true);
			axiosClientJSON({
				url: '/search',
				method: 'POST',
				data: {
					search: debouncedSearch,
					folderId,
				},
			}).then((res) => {
				setSearching(false);
				const format = {};

				// seperate by depth found in folder
				res.data.forEach((record) => {
					const { relativePath } = record;
					if (!format[relativePath.length]) {
						format[relativePath.length] = [];
					}
					format[relativePath.length].push(record);
				});

				// sorted by least amount of name characters first, then by alphabetical order
				Object.entries(format).forEach(([key, value]) => {
					const ordered = [...value];
					format[key] = ordered.sort(
						(a, b) =>
							a.name.length - b.name.length || a.name.localeCompare(b.name)
					);
				});

				setSearchResponse(format);
			});
		}
	}, [debouncedSearch]);

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

	useLayoutEffect(() => {
		if (search.length >= 1) {
			handleRenderSearchMenu();
		} else {
			toggleMenu(false);
			setSearchResponse([]);
		}
	}, [search]);

	const tooltipProps = {
		captureFocus, // does not switch focus to contextMenu while typing in input
	};

	// returns focus to input to receive key input while leaving the menu still open
	const handleOnKeyDownSearchItem = (e) => {
		inputRef.current.focus();
		toggleMenu(true);
		setCaptureFocus(false);
	};

	const handleOnKeyDownInput = (e) => {
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			setCaptureFocus(true);
		}
	};

	const title = (record) => {
		const { relativePathName } = record;
		const name = renderName(record);
		if (relativePathName.length === 0) {
			return '../' + name;
		}
		return '../' + relativePathName.join('/') + '/' + name;
	};

	const handleOnClick = (record) => {
		const { relativePath } = record;

		if (relativePath.length === 0) {
			// just select the file
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						// clearing other selected files and folders
						selectedFolders: {
							$set: record.__typename === 'folder' ? [record.id] : [],
						},
						selectedFiles: {
							$set: record.__typename === 'file' ? [record.id] : [],
						},
					},
				})
			);
		} else {
			const { paths, currentIndex } = tabsState[activeTabId].history;
			const newPath = [...tabsState[activeTabId].path, ...relativePath];
			let newPaths = [...paths];
			newPaths = newPaths.splice(0, currentIndex + 1);
			newPaths = [...newPaths, newPath];
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						// adding path in a way that allows keeping track of history
						path: { $set: newPath },
						history: {
							paths: { $set: newPaths },
							currentIndex: { $apply: (val) => val + 1 },
						},
						// clearing other selected files and folders
						selectedFolders: {
							$set: record.__typename === 'folder' ? [record.id] : [],
						},
						selectedFiles: {
							$set: record.__typename === 'file' ? [record.id] : [],
						},
					},
				})
			);
		}

		toggleMenu(false);
		setSearch('');
		setMobileSearchExpanded(false);
	};

	const onClick = () => {
		if (!mobileSearchExpanded) {
			inputRef.current.focus();
		}
		setMobileSearchExpanded(!mobileSearchExpanded);
	};

	return (
		<div className="shrink-0 flex">
			<div
				ref={searchContainerRef}
				className={
					'w-64 px-2 flex align-center justify-between cursor-text ' +
					breakpointClass({
						sm: 'block',
						default: !mobileSearchExpanded ? 'hidden' : '',
					})
				}
				onClick={handleSearchOnClick}
			>
				<input
					ref={inputRef}
					className={'rounded-sm px-1 w-full bg-shade-3'}
					type="search"
					placeholder="Seach"
					value={search}
					onChange={handleSearchOnChange}
					onKeyDown={handleOnKeyDownInput}
				/>

				<ControlledMenu
					{...menuProps}
					{...tooltipProps}
					anchorPoint={anchorPoint}
					onClose={() => toggleMenu(false)}
				>
					<div className="searchItems w-56">
						{searching ? (
							'Searching ...'
						) : (
							<>
								{Object.values(searchResponse).map((value, i) => (
									<Fragment key={i}>
										{value.map((record) => (
											<FileMenuItem
												key={`${record.id}-${record.__typename}`}
												img={
													<RenderIcon
														className="w-6 h-6 pr-1 object-contain"
														{...{ record, fileExtensionsMap }}
													/>
												}
												description={renderName(record)}
												onKeyDown={handleOnKeyDownSearchItem}
												onClick={() => handleOnClick(record)}
												title={title(record)}
											/>
										))}
										{i !== Object.values(searchResponse).length - 1 && (
											<MenuDivider />
										)}
									</Fragment>
								))}

								{Object.values(searchResponse).length === 0 && (
									<FileMenuItem
										controlledStatePadding={true}
										description="No results found"
										onKeyDown={handleOnKeyDownSearchItem}
										title="No results found"
									/>
								)}
							</>
						)}
					</div>
				</ControlledMenu>
			</div>
			<span
				className={
					buttonStyle +
					'hover bg-shade-2 ' +
					breakpointClass({
						sm: 'hidden',
						default: '',
					})
				}
				onClick={onClick}
			>
				search
			</span>
		</div>
	);
};

export default Search;
