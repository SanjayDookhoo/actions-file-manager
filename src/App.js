import { createContext, useEffect, useState } from 'react';
import FileExplorer from './FileExplorer/FileExplorer';

const App = (props) => {
	const [chooseColor, setChooseColor] = useState(false);
	const [color, setColor] = useState('#7eb9a0');
	const [themeSettings, setThemeSettings] = useState('light');

	const fileExplorerProps = {
		chooseColor,
		color,
		themeSettings,
	};

	return (
		<div className="flex flex-col h-screen w-full">
			<div>
				Choose color
				<input
					type="checkbox"
					value={chooseColor}
					onChange={(e) => setChooseColor(e.target.checked)}
				/>
				<span className="slider"></span>
				{chooseColor && (
					<>
						Color
						<input
							type="color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
						/>
					</>
				)}
				Text Color
				<select
					value={themeSettings}
					onChange={(e) => setThemeSettings(e.target.value)}
				>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
					<option value="systemDefault">System default</option>
				</select>
			</div>
			<div className="grow">
				<FileExplorer {...props} {...fileExplorerProps} />
			</div>
		</div>
	);
};

export default App;
