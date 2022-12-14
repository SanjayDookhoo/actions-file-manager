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
			width: '210px',
			order: 1,
			visible: true,
		},
		modified: {
			width: '210px',
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
			width: '210px',
			order: 5,
			visible: false,
		},
		lastAccessed: {
			width: '210px',
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

export const newFolderNameDefault = 'Untitled Folder';

export const videoTypes = ['mp4', 'webm', 'ogg']; // https://www.w3schools.com/tags/tag_video.asp
export const audioTypes = ['mp3', 'wav', 'ogg']; // https://www.w3schools.com/tags/tag_audio.asp
export const imageTypes = [
	'apng',
	'avif',
	'gif',
	'jpg',
	'jpeg',
	'jfif',
	'pjpeg',
	'pjp',
	'png',
	'svg',
	'webp',
]; // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types

export const toastAutoClose = 2000;

export const defaultConditionalColor = '#59A3F3';
