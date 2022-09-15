import { axiosClientFiles } from '../endpoint';
import _update from 'immutability-helper';

export const uploadFiles = (files, folderId) => {
	if (files.length > 0) {
		// TODO: upload files to backend
		let formData = new FormData();
		const filesPath = [];
		// the files are not stored in a normal array
		for (let i = 0; i < files.length; i++) {
			const { filepath, webkitRelativePath, name } = files[i];
			formData.append('file', files[i]);
			let filePath = filepath ? filepath : webkitRelativePath; // filepath is what the drag and drop package uses, webkitRelativePath is what the files input for folders uses
			filePath = filePath.slice(0, -(name.length + 1)); // removes the end of the filePath that is the / + name + fileExtension, ie /fileName.txt
			filesPath.push(filePath);
		}
		formData.append('filesPath', JSON.stringify(filesPath));
		formData.append('folderId', folderId);

		const res = axiosClientFiles({
			url: '/upload',
			method: 'POST',
			data: formData,
		});
		// console.log(res);
	}
};

export const update = _update; // does not allow vs code importing because it is not a named export, this makes it easier

export const getFolderId = ({ tabsState, activeTabId }) => {
	const path = tabsState[activeTabId].path;
	let folderId = path[path.length - 1];
	folderId = Number.isInteger(folderId) ? folderId : null;
	return folderId;
};

const k = 1024;

// date memoizing to prevent multiple calls with the same value from being called multiple times
let initialDateMemoizeObj = {
	_aLongTimeAgo: {},
	_earlierThisYear: {},
	_lastMonth: {},
	_earlierThisMonth: {},
	_lastWeek: {},
	_earlierThisWeek: {},
	_yesterday: {},
	_today: {},
};

const dateMemoize = {
	dateMemoizeObj: { ...initialDateMemoizeObj },
	date: new Date(),
};

const dateMemoizeCheck = (condition, val) => {
	const { date } = dateMemoize;
	const currDate = new Date();

	if (
		date.getFullYear() != currDate.getFullYear() ||
		date.getMonth() != currDate.getMonth() ||
		date.getDay() != currDate.getDay()
	) {
		dateMemoize = {
			dateMemoizeObj: { ...initialDateMemoizeObj },
			date: currDate,
		};
	}

	return dateMemoize.dateMemoizeObj[condition]?.[val];
};

const _aLongTimeAgo = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_aLongTimeAgo', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	return (dateMemoize.dateMemoizeObj['_aLongTimeAgo'][val] =
		!_earlierThisYear(val) &&
		!_lastMonth(val) &&
		!_earlierThisMonth(val) &&
		!_lastWeek(val) &&
		!_earlierThisWeek(val) &&
		!_yesterday(val) &&
		!_today(val));
};

const _earlierThisYear = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_earlierThisYear', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	const valDate = new Date(val);
	const min = new Date();
	min.setMonth(0);
	min.setDate(1);
	min.setHours(0, 0, 0, 0);
	return (dateMemoize.dateMemoizeObj['_earlierThisYear'][val] =
		valDate > min &&
		!_lastMonth(val) &&
		!_earlierThisMonth(val) &&
		!_lastWeek(val) &&
		!_earlierThisWeek(val) &&
		!_yesterday(val) &&
		!_today(val));
};

const _lastMonth = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_lastMonth', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	const valDate = new Date(val);
	const min = new Date();
	min.setMonth(min.getMonth() - 1);
	min.setDate(1);
	min.setHours(0, 0, 0, 0);
	const max = new Date();
	max.setDate(1);
	max.setHours(0, 0, 0, 0);
	return (dateMemoize.dateMemoizeObj['_lastMonth'][val] =
		valDate > min && valDate < max);
};

const _earlierThisMonth = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_earlierThisMonth', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	const valDate = new Date(val);
	const d = new Date();
	d.setDate(1);
	d.setHours(0, 0, 0, 0);
	return (dateMemoize.dateMemoizeObj['_earlierThisMonth'][val] =
		valDate > d &&
		!_lastWeek(val) &&
		!_earlierThisWeek(val) &&
		!_yesterday(val) &&
		!_today(val));
};

const _lastWeek = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_lastWeek', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	const valDate = new Date(val);
	const max = new Date();
	let day;
	day = max.getDay();
	max.setHours(0, 0, 0, 0);
	max.setDate(max.getDate() - day);

	const min = new Date();
	day = min.getDay();
	min.setHours(0, 0, 0, 0);
	min.setDate(min.getDate() - day - 7);

	// within last week AND in this month
	return (dateMemoize.dateMemoizeObj['_lastWeek'][val] =
		valDate > min && valDate < max && min.getMonth() == valDate.getMonth());
};

const _earlierThisWeek = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_earlierThisWeek', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	const valDate = new Date(val);
	const d = new Date();
	const day = d.getDay();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - day);
	return (dateMemoize.dateMemoizeObj['_earlierThisWeek'][val] =
		valDate > d && !_yesterday(val) && !_today(val));
};

const _yesterday = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_yesterday', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	const valDate = new Date(val);
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return (dateMemoize.dateMemoizeObj['_yesterday'][val] =
		valDate.toDateString() == d.toDateString());
};

const _today = (val) => {
	const dateMemoizeCheckVal = dateMemoizeCheck('_today', val);
	if (dateMemoizeCheckVal != undefined) return dateMemoizeCheckVal;

	const valDate = new Date(val);
	const d = new Date();
	return (dateMemoize.dateMemoizeObj['_today'][val] =
		valDate.toDateString() == d.toDateString());
};

export const conditions = {
	name: {
		'0-9': (val) => val == /[0-9]/.test(val.charAt(0)),
		'A-H': (val) => val == /[a-hA-H]/.test(val.charAt(0)),
		'I-P': (val) => val == /[i-pI-P]/.test(val.charAt(0)),
		'Q-Z': (val) => val == /[q-zQ-Z]/.test(val.charAt(0)),
		Other: (val) => val == /[0-9a-hA-Hi-pI-Pq-zQ-Z]/.test(val.charAt(0)),
	},
	// a week is treated as beginning on sunday and ending on saturday
	date: {
		// 'Select a date or date range': (val, dateRange) => val == 0,
		'A long time ago': _aLongTimeAgo,
		'Earlier this year': _earlierThisYear,
		'Last month': _lastMonth,
		'Earlier this month': _earlierThisMonth,
		'Last week': _lastWeek,
		'Earlier this week': _earlierThisWeek,
		Yesterday: _yesterday,
		Today: _today,
	},
	// type: {},
	size: {
		'Empty (0KB)': (val) => val == 0,
		'Tiny (0 - 16 KB)': (val) => val > 0 && val <= 16 * k,
		'Small (16KB - 1 MB)': (val) => val > 16 * k && val <= k * k,
		'Medium (1 - 128 MB)': (val) => val > k * k && val <= 128 * k * k,
		'Large (128 MB - 1 GB)': (val) => val > 128 * k * k && val <= k * k * k,
		'Huge (1 - 4 GB)': (val) => val > k * k * k && val <= 4 * k * k * k,
		'Gigantic (> 4GB)': (val) => val > 4 * k * k * k,
		Unspecified: (val) => val == null,
	},
};

export const formatBytes = (bytes, decimals = 2) => {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
