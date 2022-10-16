import { useState, useEffect } from 'react';
import { buttonStyle } from '../../../utils/constants';
import { camelCaseToPhrase } from '../../../utils/utils';

const FilterContextGroup = ({
	groupName,
	filterOptions,
	index,
	handleFilterOptionOnClick,
	handleCheckboxOnChange,
	isChecked,
	filterSelected,
	opened,
	setOpened,
}) => {
	const handleOpenClick = (e) => {
		e.stopPropagation();
		setOpened(groupName);
	};

	return (
		<div className="px-4">
			<div
				className="flex items-center select-none hover"
				onClick={handleOpenClick}
			>
				<div>
					<span className={buttonStyle}>
						{opened == groupName ? 'expand_more' : 'expand_less'}
					</span>
				</div>
				<div className="py-2 flex items-center">
					{camelCaseToPhrase(groupName)}
					{filterSelected[groupName] && (
						<span className={'material-symbols-outlined '}>filter_alt</span>
					)}
				</div>
				<div className="ml-3 group-separator"></div>
			</div>
			<div
				className={
					'flex flex-col flex-wrap overflow-auto ' +
					(opened != groupName ? 'hidden ' : ' ')
				}
				style={{ maxHeight: '200px' }}
			>
				{Object.keys(filterOptions).map((filterOption) => (
					<div
						key={filterOption}
						className="flex px-3"
						onClick={() => handleFilterOptionOnClick(groupName, filterOption)}
					>
						<input
							className="mr-1"
							type="checkbox"
							checked={isChecked(groupName, filterOption)}
							onChange={(e) => handleCheckboxOnChange(groupName, filterOption)}
							onClick={(e) => e.stopPropagation()}
						/>
						<div>{filterOption}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default FilterContextGroup;
