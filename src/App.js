import { createContext, useState } from 'react';
import FileExplorer from './FileExplorer/FileExplorer';

const App = (props) => {
	const [color, setColor] = useState('#ff0000');

	return (
		<div className="flex flex-col h-screen w-full">
			<div>
				<input
					type="color"
					id="favcolor"
					name="favcolor"
					value={color}
					onChange={(e) => setColor(e.target.value)}
				/>
			</div>
			<div className="grow">
				<FileExplorer {...props} color={color} />
			</div>
		</div>
	);
};

export default App;
