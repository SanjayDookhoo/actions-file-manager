export const buttonStyle =
	'material-symbols-outlined w-9 h-9 flex justify-center items-center rounded-lg ';

export const initialLocalStorageState = {
	multiselect: false,
	showHiddenItems: true,
	showFileExtensions: false,
	showDetailsPane: true,
	layout: 'details',
	detailsLayoutMeta: {
		name: {
			width: '150px',
			order: 1,
			visible: true,
		},
		modified: {
			width: '150px',
			order: 2,
			visible: true,
		},
		type: {
			width: '150px',
			order: 3,
			visible: true,
		},
		size: {
			width: '150px',
			order: 4,
			visible: true,
		},
		created: {
			width: '150px',
			order: 5,
			visible: false,
		},
		lastAccessed: {
			width: '150px',
			order: 6,
			visible: false,
		},
	},
	folderSpecific: {},
	renaming: false,
};

export const layoutOptions = [
	'details',
	'tiles',
	'smallIcons',
	'mediumIcons',
	'largeIcons',
];
