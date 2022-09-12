import { useEffect, useState } from 'react';
import { buttonStyle } from '../utils/constants';
import FolderPath from './FolderPath/FolderPath';
import Search from './Search/Search';

const NavigationBar = () => {
	return (
		<div className="flex items-center justify-start bg-zinc-800">
			<a>
				<span className={buttonStyle}>west</span>
			</a>
			<a>
				<span className={buttonStyle}>east</span>
			</a>
			<a>
				<span className={buttonStyle}>north</span>
			</a>
			<a>
				<span className={buttonStyle}>refresh</span>
			</a>
			<FolderPath />
			<Search />
			<a>
				<span className={buttonStyle}>settings</span>
			</a>
		</div>
	);
};

export default NavigationBar;
