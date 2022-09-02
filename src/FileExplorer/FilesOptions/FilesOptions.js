import { useEffect, useState } from 'react';
import { buttonStyle } from '../utils/constants';

const FilesOptions = () => {
	return (
		<div className="flex">
			<a title="cut">
				<span className={buttonStyle}>cut</span>
			</a>
			<a title="copy">
				<span className={buttonStyle}>content_copy</span>
			</a>
			<a title="paste">
				<span className={buttonStyle}>content_paste</span>
			</a>
			<a title="share">
				<span className={buttonStyle}>drive_file_rename_outline</span>
			</a>
			<a title="delete">
				<span className={buttonStyle}>delete</span>
			</a>
		</div>
	);
};

export default FilesOptions;
