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
import { camelCaseToPhrase, createBuckets, update } from '../../utils/utils';
import { FileExplorerContext } from '../../FileExplorer';

const FilterContext = ({
	files,
	folders,
	fileExtensionsMap,
	setFolderArguments,
	setFileArguments,
	filtered,
	setFiltered,
}) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
	} = useContext(FileExplorerContext);

	const [filterSelected, setFilterSelected] = useState({});
	const [groupBuckets, setGroupBuckets] = useState({});

	useEffect(() => {
		const filteredFolders = folders.map((folder) => ({
			id: folder.id,
			type: 'folder',
		}));
		const filteredFiles = files.map((file) => ({ id: file.id, type: 'file' }));
		const records = [...filteredFolders, ...filteredFiles];
		const bucket = createBuckets({
			records,
			files,
			folders,
			fileExtensionsMap,
		});
		setGroupBuckets(bucket);
	}, [files, folders, fileExtensionsMap]);

	useEffect(() => {
		const tempGroupBuckets = { ...groupBuckets };

		Object.entries(filterSelected).forEach(([groupName, filterOptionKeys]) => {
			tempGroupBuckets[groupName] = {}; // clear all

			filterOptionKeys.forEach((filterOptionKey) => {
				tempGroupBuckets[groupName] = {
					...tempGroupBuckets[groupName],
					[filterOptionKey]: groupBuckets[groupName][filterOptionKey],
				};
			});
		});

		const inclusion = {};
		Object.entries(tempGroupBuckets).forEach(([groupName, filterOptions]) => {
			let temp = [];

			Object.values(filterOptions).forEach((value) => {
				temp = [...temp, ...Object.values(value)];
			});
			inclusion[groupName] = [...new Set(temp)];
		});

		console.log(inclusion);

		// create final array of items
		// choose array of the smallest length to start with
		let smallestGroupName;
		let smallestGroupSize;
		Object.entries(inclusion).forEach(([groupName, inclusionValues]) => {
			if (
				smallestGroupName == null ||
				inclusionValues.length < smallestGroupSize
			) {
				smallestGroupName = groupName;
				smallestGroupSize = inclusionValues.length;
			}
		});

		// may not yet have data to give a value to smallestGroupName
		if (smallestGroupName) {
			const finalList = [];
			inclusion[smallestGroupName].forEach((el) => {
				let flag = true;

				for (const [groupName, inclusionValues] of Object.entries(inclusion)) {
					if (groupName != smallestGroupName) {
						if (!inclusionValues.includes(el)) {
							flag = false;
							break;
						}
					}
				}
				if (flag) finalList.push(el);
			});

			setFiltered(finalList);
		}
	}, [groupBuckets, filterSelected]);

	const handleFilterStateChange = (groupName, filterOption) => {
		const tempFilterSelected = { ...filterSelected };
		let tempGroupName = tempFilterSelected[groupName];

		if (!tempGroupName) {
			tempFilterSelected[groupName] = [filterOption];
			setFilterSelected(tempFilterSelected);
		} else {
			tempGroupName = [...tempGroupName];
			if (tempGroupName.includes(filterOption)) {
				const index = tempGroupName.indexOf(filterOption);
				tempGroupName.splice(index, 1);
				if (tempGroupName.length == 0) {
					delete tempFilterSelected[groupName];
					setFilterSelected(tempFilterSelected);
				} else {
					setFilterSelected({
						...tempFilterSelected,
						[groupName]: tempGroupName,
					});
				}
			} else {
				tempGroupName.push(filterOption);
				setFilterSelected({
					...tempFilterSelected,
					[groupName]: tempGroupName,
				});
			}
		}
	};

	const handleCheckboxOnChange = (e, groupName, filterOption) => {
		e.stopPropagation();
		handleFilterStateChange(groupName, filterOption);
	};

	const handleFilterOptionOnClick = (groupName, filterOption) => {
		handleFilterStateChange(groupName, filterOption);
		// TODO: close menu
	};

	const isChecked = (groupName, filterOption) => {
		const group = filterSelected?.[groupName] ?? [];
		return group.includes(filterOption);
	};

	return (
		<Menu
			menuButton={
				<a title="Filter">
					<span className={buttonStyle}>
						{Object.keys(filterSelected).length == 0
							? 'filter_alt_off'
							: 'filter_alt'}
					</span>
				</a>
			}
		>
			<div className="flex" style={{ width: '1000px' }}>
				{Object.entries(groupBuckets).map(([groupName, filterOptions]) => (
					<div key={groupName} className="px-4">
						<div className="py-2 flex">
							{camelCaseToPhrase(groupName)}
							{filterSelected[groupName] && (
								<span className={buttonStyle}>filter_alt</span>
							)}
						</div>
						{Object.keys(filterOptions).map((filterOption) => (
							<div
								key={filterOption}
								className="flex"
								onClick={() =>
									handleFilterOptionOnClick(groupName, filterOption)
								}
							>
								<input
									type="checkbox"
									checked={isChecked(groupName, filterOption)}
									onChange={(e) =>
										handleCheckboxOnChange(e, groupName, filterOption)
									}
								/>
								<div>{filterOption}</div>
							</div>
						))}
					</div>
				))}
			</div>
		</Menu>
	);
};

export default FilterContext;
