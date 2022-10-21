import { createContext, useEffect, useState } from 'react';
import FileManager from './FileManager/FileManager';
import { defaultConditionalColor } from './FileManager/utils/constants';

const App = (props) => {
	const [color, setColor] = useState(defaultConditionalColor);
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
		color,
		themeSettings,
		// actions: groupActions,
	};

	return (
		<div className="flex flex-col h-screen w-full">
			<div>
				Color
				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
				/>
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
