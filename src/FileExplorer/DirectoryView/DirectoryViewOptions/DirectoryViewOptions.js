import { useEffect, useState } from 'react';
import FilesOptions from '../../FilesOptions/FilesOptions';
import { buttonStyle } from '../../utils/constants';

const DirectoryViewOptions = () => {
	return (
		<div className="w-full flex justify-between">
			<div className="flex">
				<a className="flex items-center" title="cut">
					<span className={buttonStyle}>add</span>
					New
				</a>
				<FilesOptions />
			</div>
			<div className="flex">
				<a title="selection">
					<span className={buttonStyle}>check_box</span>
				</a>
				<a title="sort">
					<span className={buttonStyle}>swap_vert</span>
				</a>
				<a title="layout">
					<span className={buttonStyle}>grid_view</span>
				</a>
				<a title="preview pane">
					<span className={buttonStyle}>preview</span>
				</a>
			</div>
		</div>
	);
};

export default DirectoryViewOptions;
