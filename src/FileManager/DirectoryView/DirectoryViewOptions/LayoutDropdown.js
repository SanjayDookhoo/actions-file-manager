import { useContext } from 'react';
import { layoutOptions } from '../../utils/constants';
import { MenuRadioGroup, MenuDivider, MenuHeader } from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import { FileManagerContext } from '../../FileManager';
import { camelCaseToPhrase, shortcutHintGenerate } from '../../utils/utils';

const LayoutDropdown = () => {
	const { localStorage, setLocalStorage } = useContext(FileManagerContext);

	return (
		<>
			<MenuHeader>Layout</MenuHeader>
			<MenuRadioGroup
				value={localStorage.layout}
				onRadioChange={(e) =>
					setLocalStorage({ ...localStorage, layout: e.value })
				}
			>
				{layoutOptions.map((layoutOption, i) => (
					<FileMenuItem
						key={layoutOption}
						description={camelCaseToPhrase(layoutOption)}
						type="radio"
						value={layoutOption}
						shortcutHint={shortcutHintGenerate(`Ctrl+Shift+${i + 1}`)}
					/>
				))}
			</MenuRadioGroup>

			<MenuDivider />
			<MenuHeader>Other</MenuHeader>
			<FileMenuItem
				description="Show hidden items"
				type="checkbox"
				checked={localStorage.showHiddenItems}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, showHiddenItems: e.checked })
				}
			/>
			<FileMenuItem
				description="Show file extensions"
				type="checkbox"
				checked={localStorage.showFileExtensions}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, showFileExtensions: e.checked })
				}
			/>
			{/* <FileMenuItem
				description="Show details pane"
				type="checkbox"
				checked={localStorage.showDetailsPane}
				onClick={(e) =>
					setLocalStorage({ ...localStorage, showDetailsPane: e.checked })
				}
			/> */}
		</>
	);
};

export default LayoutDropdown;
