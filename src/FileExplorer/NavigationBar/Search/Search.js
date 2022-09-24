import {
	Fragment,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { buttonStyle } from '../../utils/constants';
import {
	ControlledMenu,
	MenuDivider,
	MenuItem,
	useMenuState,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { axiosClientJSON } from '../../endpoint';
import { FileExplorerContext } from '../../FileExplorer';
import { getFolderId, update } from '../../utils/utils';
import RenderIcon from '../../DirectoryView/DirectoryLayout/Group/ItemContainer/Layout/RenderIcon';

const Search = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		fileExtensionsMap,
		rootUserFolderId,
	} = useContext(FileExplorerContext);

	const [search, setSearch] = useState('');
	const [searching, setSearching] = useState(false);
	const inputRef = useRef();
	const searchContainerRef = useRef();

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [captureFocus, setCaptureFocus] = useState(false);

	const [searchResponse, setSearchResponse] = useState([]);

	useEffect(() => {
		const folderId = getFolderId({ tabsState, activeTabId, rootUserFolderId });
		if (search) {
			setSearching(true);
			axiosClientJSON({
				url: '/search',
				method: 'POST',
				data: {
					search,
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
	}, [search]);

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
		if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
			e.preventDefault();
			setCaptureFocus(true);
		}
	};

	const title = (record) => {
		const { relativePathName, name } = record;
		if (relativePathName.length == 0) {
			return '../' + name;
		}
		return '../' + relativePathName.join('/') + '/' + name;
	};

	const handleOnClick = (record) => {
		const { relativePath } = record;

		if (relativePath.length == 0) {
			// just select the file
			setTabsState(
				update(tabsState, {
					[activeTabId]: {
						// clearing other selected files and folders
						selectedFolders: {
							$set: record.__typename == 'folder' ? [record.id] : [],
						},
						selectedFiles: {
							$set: record.__typename == 'file' ? [record.id] : [],
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
							$set: record.__typename == 'folder' ? [record.id] : [],
						},
						selectedFiles: {
							$set: record.__typename == 'file' ? [record.id] : [],
						},
					},
				})
			);
		}

		toggleMenu(false);
		setSearch('');
	};

	useEffect(() => {
		console.log(tabsState);
	}, [tabsState]);

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
				onKeyDown={handleOnKeyDownInput}
			/>
			<div className="flex align-center">
				{search && (
					<a onClick={clearText}>
						<span className={buttonStyle}>close</span>
					</a>
				)}
			</div>

			<ControlledMenu
				{...menuProps}
				{...tooltipProps}
				anchorPoint={anchorPoint}
				onClose={() => toggleMenu(false)}
			>
				<div className="searchItems w-64">
					{searching ? (
						'Searching ...'
					) : (
						<>
							{Object.values(searchResponse).map((value, i) => (
								<Fragment key={value}>
									{value.map((record) => (
										<FileMenuItem
											key={`${record.id}-${record.__typename}`}
											img={
												<RenderIcon
													className="w-6 h-6"
													{...{ record, fileExtensionsMap }}
												/>
											}
											description={record.name}
											onKeyDown={handleOnKeyDownSearchItem}
											onClick={() => handleOnClick(record)}
											title={title(record)}
										/>
									))}
									{i != Object.values(searchResponse).length - 1 && (
										<MenuDivider />
									)}
								</Fragment>
							))}

							{Object.values(searchResponse).length == 0 && 'No results found'}
						</>
					)}
				</div>
			</ControlledMenu>
		</div>
	);
};

export default Search;
