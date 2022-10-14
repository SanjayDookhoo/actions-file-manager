import { useContext, useEffect, useRef, useState } from 'react';
import FilesOptions from '../../FilesOptions/FilesOptions';
import { buttonStyle, layoutOptions } from '../../utils/constants';
import {
	Menu,
	MenuItem,
	FocusableItem,
	SubMenu,
	MenuRadioGroup,
	MenuDivider,
	MenuHeader,
} from '@szhsin/react-menu';
import FileMenuItem from '../../CustomReactMenu/FileMenuItem';
import FileSubMenu from '../../CustomReactMenu/FileSubMenu';
import { FileExplorerContext } from '../../FileExplorer';
import {
	camelCaseToPhrase,
	isMacOs,
	shortcutHintGenerate,
} from '../../utils/utils';

const LayoutDropdown = () => {
	const { localStorage, setLocalStorage } = useContext(FileExplorerContext);

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
