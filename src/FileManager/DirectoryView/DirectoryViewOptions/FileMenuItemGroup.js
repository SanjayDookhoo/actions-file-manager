import FileMenuItem from '../../CustomReactMenu/FileMenuItem';

const FileMenuItemGroup = () => {
	return (
		<>
			<FileMenuItem description="Name" type="radio" value="name" />
			<FileMenuItem description="Date Modified" type="radio" value="modified" />
			<FileMenuItem description="Date Created" type="radio" value="created" />
			<FileMenuItem
				description="Last Accessed"
				type="radio"
				value="lastAccessed"
			/>
			<FileMenuItem description="Size" type="radio" value="size" />
			<FileMenuItem description="Type" type="radio" value="type" />
		</>
	);
};

export default FileMenuItemGroup;
