import { useContext, useEffect, useRef, useState } from 'react';
import FilesOptions from '../../FilesOptions/FilesOptions';
import { buttonStyle } from '../../utils/constants';
import {
	Menu,
	MenuItem,
	FocusableItem,
	SubMenu,
	MenuRadioGroup,
	MenuDivider,
	ControlledMenu,
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
	const [isOpen, setOpen] = useState();
	const ref = useRef(null);
	const { path } = tabsState[activeTabId];

	useEffect(() => {
		setFilterSelected({});
	}, [path]);

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

	// setFiltered is called in here, this limits the actual amount of records shown
	useEffect(() => {
		// for each groupName, it will include only the filterOptions that the filter allows
		// no filter applied to a groupName means all filterOptions will be shown
		const groupBurcketsFilterSelected = { ...groupBuckets };
		Object.entries(filterSelected).forEach(([groupName, filterOptionKeys]) => {
			groupBurcketsFilterSelected[groupName] = {}; // clear all

			filterOptionKeys.forEach((filterOptionKey) => {
				groupBurcketsFilterSelected[groupName] = {
					...groupBurcketsFilterSelected[groupName],
					[filterOptionKey]: groupBuckets[groupName][filterOptionKey],
				};
			});
		});

		// for each groupName, all the filterOptions arrays are merged into one single array of records the filter allows
		const inclusion = {};
		Object.entries(groupBurcketsFilterSelected).forEach(
			([groupName, filterOptions]) => {
				let temp = [];

				Object.values(filterOptions).forEach((value) => {
					temp = [...temp, ...Object.values(value)];
				});
				inclusion[groupName] = [...new Set(temp)];
			}
		);

		// create final array of items created here, the smallest array of groupName is chosen, where each value in that array is compared with the other groups, if the value exists in all other groups, then it is allowed to be shown

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

		// may not yet have data to give a value to smallestGroupName, based on how the useEffects are executed
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

		// if no property of groupName, create it and add filterOption
		if (!tempGroupName) {
			tempFilterSelected[groupName] = [filterOption];
			setFilterSelected(tempFilterSelected);
		} else {
			tempGroupName = [...tempGroupName];

			if (tempGroupName.includes(filterOption)) {
				const index = tempGroupName.indexOf(filterOption);
				tempGroupName.splice(index, 1);
				// needs to be removed, but if its removed, and the property now has no items, the entire property should be removed, because an empty group name property is treated as all selected
				if (tempGroupName.length == 0) {
					delete tempFilterSelected[groupName];
					setFilterSelected(tempFilterSelected);
				} else {
					// just remove filterOption and update state
					setFilterSelected({
						...tempFilterSelected,
						[groupName]: tempGroupName,
					});
				}
			} else {
				// property of groupName, does not include filterOption, simply just add it
				tempGroupName.push(filterOption);
				setFilterSelected({
					...tempFilterSelected,
					[groupName]: tempGroupName,
				});
			}
		}
	};

	const handleCheckboxOnChange = (groupName, filterOption) => {
		handleFilterStateChange(groupName, filterOption);
	};

	const handleFilterOptionOnClick = (groupName, filterOption) => {
		handleFilterStateChange(groupName, filterOption);
		setOpen(false); // close menu
	};

	const isChecked = (groupName, filterOption) => {
		const group = filterSelected?.[groupName] ?? [];
		return group.includes(filterOption);
	};

	return (
		<>
			<a title="Filter" ref={ref} onClick={() => setOpen(true)}>
				<span className={buttonStyle}>
					{Object.keys(filterSelected).length == 0
						? 'filter_alt_off'
						: 'filter_alt'}
				</span>
			</a>
			<ControlledMenu
				state={isOpen ? 'open' : 'closed'}
				anchorRef={ref}
				onClose={() => setOpen(false)}
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
											handleCheckboxOnChange(groupName, filterOption)
										}
										onClick={(e) => e.stopPropagation()}
									/>
									<div>{filterOption}</div>
								</div>
							))}
						</div>
					))}
				</div>
			</ControlledMenu>
		</>
	);
};

export default FilterContext;