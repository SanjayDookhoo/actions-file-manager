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

const Search = ({ fileExtensionsMap }) => {
	const { tabsState, setTabsState, activeTabId, setActiveTabId } =
		useContext(FileExplorerContext);

	const [search, setSearch] = useState('');
	const inputRef = useRef();
	const searchContainerRef = useRef();

	const [menuProps, toggleMenu] = useMenuState();
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [captureFocus, setCaptureFocus] = useState(false);

	const [searchResponse, setSearchResponse] = useState([]);

	useEffect(() => {
		const folderId = getFolderId({ tabsState, activeTabId });
		if (search) {
			const res = axiosClientJSON({
				url: '/search',
				method: 'POST',
				data: {
					search,
					folderId,
				},
			}).then((res) => {
				// console.log(res.data);

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

	const openSearchInWindow = (e) => {
		e.stopPropagation();
		// TODO openSearchInWindow
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
		setTabsState(
			update(tabsState, {
				[activeTabId]: {
					path: {
						$push: relativePath,
					},
					selectedFolders: {
						$set: record.__typename == 'Folder' ? [record.id] : [],
					},
					selectedFiles: {
						$set: record.__typename == 'File' ? [record.id] : [],
					},
				},
			})
		);
		toggleMenu(false);
		setSearch('');
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
				onKeyDown={handleOnKeyDownInput}
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
				<div className="searchItems w-64">
					{Object.values(searchResponse).map((value, i) => (
						<Fragment key={value}>
							{value.map((record) => (
								<FileMenuItem
									key={`${record.id}-${record.__typename}`}
									logo="folder"
									// logo={<RenderIcon className="w-4 h-4" {...{ record, fileExtensionsMap }} />}
									description={record.name}
									onKeyDown={handleOnKeyDownSearchItem}
									onClick={() => handleOnClick(record)}
									title={title(record)}
								/>
							))}
							{i != Object.values(searchResponse).length - 1 && <MenuDivider />}
						</Fragment>
					))}
				</div>
			</ControlledMenu>
		</div>
	);
};

export default Search;
