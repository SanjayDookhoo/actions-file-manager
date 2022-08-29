import { useEffect, useState } from 'react';
import { button_style } from '../utils/constants';
import FolderPath from './FolderPath';
import Search from './Search';

const NavigationBar = () => {
	return (
		<div className="flex items-center justify-start">
			<a>
				<span className={button_style}>west</span>
			</a>
			<a>
				<span className={button_style}>east</span>
			</a>
			<a>
				<span className={button_style}>north</span>
			</a>
			<a>
				<span className={button_style}>refresh</span>
			</a>
			<FolderPath />
			<Search />
			<a>
				<span className={button_style}>settings</span>
			</a>
		</div>
	);
};

export default NavigationBar;
