import { useEffect, useState } from 'react';

const FolderPath = () => {
	const [currentPath, setCurrentPath] = useState('root/documents/test');
	const [dirSplit, setDirSplit] = useState([]);

	useEffect(() => {
		const split = currentPath.split('/');
		let concatPath = '';
		const tempDirSplit = [];

		split.forEach((currDir) => {
			concatPath += '/' + currDir;
			tempDirSplit.push({
				currDir,
				path: concatPath,
			});
		});

		setDirSplit(tempDirSplit);
	}, [currentPath]);

	const handleFolderPathOnClick = (e, path) => {
		e.stopPropagation(); // TODO still should propagate it somehow, this is only because of the nested thing
		console.log('handleFolderPathEmptyOnClick', path);
	};

	return (
		<div
			className="flex grow align-center"
			onClick={(e) => handleFolderPathOnClick(e, currentPath)}
		>
			{dirSplit.map(({ currDir, path }) => (
				<div
					className="flex align-center"
					key={path}
					onClick={(e) => handleFolderPathOnClick(e, path)}
				>
					{currDir}
					<span className="material-symbols-outlined">chevron_right</span>
				</div>
			))}
		</div>
	);
};

export default FolderPath;
