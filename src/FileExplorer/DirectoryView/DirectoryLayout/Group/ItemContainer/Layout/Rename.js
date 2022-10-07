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
import { toast } from 'react-toastify';

const Rename = ({ record }) => {
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
		renderName,
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

		const { name, id, __typename } = record;
		const res = axiosClientJSON({
			url: '/rename',
			method: 'POST',
			data: {
				name: value,
				id,
				__typename,
			},
		}).catch((err) => {
			setValue(name); // return input to how it was before editing
			throw err; // still send error for toast
		});
		toast.promise(res, {
			pending: `"${name}" renaming to "${value}"`,
			success: `"${name}" renamed to "${value}"`,
			error: {
				render({ data }) {
					const { errors } = data.response.data;
					const tooLong = errors.find((error) =>
						error.message.includes('too long')
					);
					if (tooLong) {
						const charLimit = tooLong.message
							.replace('value too long for type character varying(', '')
							.replace(')', '');
						return `Failed to rename, needs to be less than ${charLimit} chars`;
					} else {
						return `"${name}" failed to rename to "${value}"`;
					}
				},
			},
		});
	};

	const handleOnBlur = async (e) => {
		await onClose();
	};

	const handleOnFocus = async (e) => {
		const { name, __typename } = record;
		if (__typename == 'file') {
			const nameSplit = name.split('.');
			nameSplit.pop();
			const cursorLocation = nameSplit.join('.').length;
			e.currentTarget.setSelectionRange(0, cursorLocation);
		}
	};

	const handleKeyDown = async (e) => {
		e.stopPropagation();
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
					className="text-black rounded-sm px-1"
					ref={ref}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={handleOnBlur}
					onFocus={handleOnFocus}
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
