import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { buttonStyle } from '../../utils/constants';

const Search = () => {
	const [search, setSearch] = useState('');
	const inputRef = useRef();
	const searchContainerRef = useRef();

	const searchDropdownProps = {
		search,
	};

	const handleSearchOnClick = (event) => {
		inputRef.current.focus();
		if (search) {
			// TODO: add context action
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
			//
			const event = {
				target: searchContainerRef.current,
				stopPropagation: () => {},
			};
			// TODO: add context menu
		} else if (search.length > 1) {
			// TODO: add context menu
		} else {
		}
	}, [search]);

	return (
		<div
			ref={searchContainerRef}
			className="w-64 px-2 flex align-center justify-between cursor-text"
			onClick={handleSearchOnClick}
		>
			<input
				ref={inputRef}
				className=""
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
		</div>
	);
};

export default Search;

const SearchDropdown = () => {
	return (
		<div className="h-64 w-64 bg-zinc-700 border border-zinc-500 rounded-lg">
			x
		</div>
	);
};
