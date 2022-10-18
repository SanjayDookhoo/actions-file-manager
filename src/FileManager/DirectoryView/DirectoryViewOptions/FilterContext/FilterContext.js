import { useContext, useEffect, useRef, useState } from 'react';
import FilesOptions from '../../../FilesOptions/FilesOptions';
import { buttonStyle } from '../../../utils/constants';
import {
	Menu,
	MenuItem,
	FocusableItem,
	SubMenu,
	MenuRadioGroup,
	MenuDivider,
	ControlledMenu,
	MenuHeader,
} from '@szhsin/react-menu';
import FileMenuItem from '../../../CustomReactMenu/FileMenuItem';
import FileSubMenu from '../../../CustomReactMenu/FileSubMenu';
import { camelCaseToPhrase, createBuckets, update } from '../../../utils/utils';
import { FileManagerContext } from '../../../FileManager';
import FilterContextGroup from './FilterContextGroup';

const FilterContext = () => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		files,
		folders,
		fileExtensionsMap,
		setFolderArguments,
		setFileArguments,
		filtered,
		setFiltered,
		fileManagerRef,
		breakpointClass,
	} = useContext(FileManagerContext);

	const [filterSelected, setFilterSelected] = useState({});
	const [groupBuckets, setGroupBuckets] = useState({});
	const [isOpen, setIsOpen] = useState();
	const ref = useRef(null);
	const { path } = tabsState[activeTabId];
	const { showHiddenItems } = localStorage;
	const [opened, setOpened] = useState('name');

	useEffect(() => {
		setFilterSelected({});
	}, [path]);

	useEffect(() => {
		const _hiddenFilter = (record) => {
			if (showHiddenItems) {
				return true;
			} else {
				const name = record.name;
				const nameSplit = name.split('.');
				return nameSplit[0];
			}
		};

		const filteredFolders = folders.filter(_hiddenFilter).map((folder) => {
			const { id, __typename } = folder;
			return {
				id,
				__typename,
			};
		});
		const filteredFiles = files.filter(_hiddenFilter).map((file) => {
			const { id, __typename } = file;
			return {
				id,
				__typename,
			};
		});
		const records = [...filteredFolders, ...filteredFiles];
		const bucket = createBuckets({
			records,
			files,
			folders,
			fileExtensionsMap,
		});
		setGroupBuckets(bucket);
	}, [files, folders, fileExtensionsMap, showHiddenItems]);

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
		} else {
			setFiltered([]);
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
		setIsOpen(false); // close menu
	};

	const isChecked = (groupName, filterOption) => {
		const group = filterSelected?.[groupName] ?? [];
		return group.includes(filterOption);
	};

	const controlledMenuPortal = {
		target: fileManagerRef.current,
		stablePosition: true,
		// https://szhsin.github.io/react-menu/docs
		// search "portal"
	};

	const filterContextGroupProps = {
		handleFilterOptionOnClick,
		handleCheckboxOnChange,
		isChecked,
		filterSelected,
		opened,
		setOpened,
	};

	return (
		<>
			<a
				className="hover flex items-center"
				title="Filter"
				ref={ref}
				onClick={() => setIsOpen(true)}
			>
				<span className={buttonStyle}>
					{Object.keys(filterSelected).length == 0
						? 'filter_alt_off'
						: 'filter_alt'}
				</span>
				<span
					className={
						'material-symbols-outlined text-sm relative -left-1 ' +
						breakpointClass({
							lg: 'block',
							default: 'hidden',
						})
					}
				>
					expand_more
				</span>
			</a>
			<ControlledMenu
				state={isOpen ? 'open' : 'closed'}
				anchorRef={ref}
				portal={controlledMenuPortal}
				onClose={() => setIsOpen(false)}
			>
				<MenuHeader>Filter</MenuHeader>
				<div
					className="flex flex-col "
					style={{ width: 'calc(100% + 20px)', paddingRight: '20px' }} // gives a 20px group seperator to the largest group name, instead of nothing at all
				>
					{Object.entries(groupBuckets).map(
						([groupName, filterOptions], index) => (
							<FilterContextGroup
								key={groupName}
								groupName={groupName}
								filterOptions={filterOptions}
								index={index}
								{...filterContextGroupProps}
							/>
						)
					)}
				</div>
			</ControlledMenu>
		</>
	);
};

export default FilterContext;
