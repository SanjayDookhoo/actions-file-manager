import {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { axiosClientJSON } from '../../../../../endpoint';
import { FileExplorerContext } from '../../../../../FileExplorer';
import { update } from '../../../../../utils/utils';

const Rename = ({ record, renderName }) => {
	const {
		tabsState,
		setTabsState,
		activeTabId,
		setActiveTabId,
		localStorage,
		setLocalStorage,
		files,
		folders,
		fileExtensionsMap,
		setFolderArguments,
		setFileArguments,
		filtered,
		setFiltered,
	} = useContext(FileExplorerContext);
	const ref = useRef();
	const [value, setValue] = useState('');

	useLayoutEffect(() => {
		if (ref.current) {
			ref.current.focus();
		}
	}, [tabsState[activeTabId].renaming]);

	useEffect(() => {
		const { name } = record;
		setValue(name);
	}, [record]);

	const onClose = async () => {
		setTabsState(
			update(tabsState, { [activeTabId]: { renaming: { $set: false } } })
		);

		const { id, __typename } = record;
		axiosClientJSON({
			url: '/rename',
			method: 'POST',
			data: {
				name: value,
				id,
				__typename,
			},
		});
	};

	const handleOnBlur = async (e) => {
		console.log('test', e);
		await onClose();
	};

	const handleKeyDown = async (e) => {
		if (e.key === 'Enter') {
			await onClose();
		}
	};

	const isRenaming = (tab) => {
		const { renaming, selectedFolders, selectedFiles } = tab;
		return (
			renaming &&
			// selectedFolders.length == 1 &&
			// selectedFiles.length == 0 &&
			(selectedFolders[0] == record.id || selectedFiles[0] == record.id)
		);
	};

	return (
		<>
			{isRenaming(tabsState[activeTabId]) ? (
				<input
					className="text-black"
					ref={ref}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={handleOnBlur}
					onKeyDown={handleKeyDown}
					onClick={(e) => e.stopPropagation()}
				/>
			) : (
				renderName(record)
			)}
		</>
	);
};

export default Rename;
