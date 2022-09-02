import { useEffect, useState } from 'react';

const LeftPane = () => {
	return (
		<div className="flex flex-col items-start" style={{ width: '250px' }}>
			<button>Home</button>
			<button>Favorites</button>
			<button>Shared with me</button>
			<button>Recycle Bin</button>
		</div>
	);
};

export default LeftPane;
