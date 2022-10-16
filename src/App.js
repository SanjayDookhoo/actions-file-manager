import { createContext, useEffect, useState } from 'react';
import FileManager from './FileManager/FileManager';

const App = (props) => {
	const [chooseColor, setChooseColor] = useState(false);
	const [color, setColor] = useState('#7eb9a0');
	const [themeSettings, setThemeSettings] = useState('light');

	const logAction = (record, toast) => {
		console.log('testing log: ', record);
		toast.success('action was successful!');
	};

	const logDisplayCondition = (record) => {
		return record.mimeType.includes('image');
	};

	const actions = [
		{
			description: 'log',
			function: logAction,
			displayCondition: logDisplayCondition,
		},
	];

	const groupActions = {
		'test group': [
			{
				description: 'log',
				function: logAction,
				displayCondition: logDisplayCondition,
			},
			{
				description: 'log2',
				function: logAction,
				displayCondition: logDisplayCondition,
			},
		],
		'test group 2': [
			{
				description: 'log',
				function: logAction,
				displayCondition: () => true,
			},
		],
	};

	const fileManagerProps = {
		chooseColor,
		color,
		themeSettings,
		// actions: groupActions,
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
				<FileManager {...props} {...fileManagerProps} />
			</div>
		</div>
	);
};

export default App;
