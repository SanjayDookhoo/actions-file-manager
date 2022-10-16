import { useEffect, useState } from 'react';

const name = 'test folder';
const type = 'folder';
const created = 'today';
const modified = 'today';
const lastAccessed = 'today';
const owner = 'me';

const DetailsPane = () => {
	const [view, setView] = useState('details'); // details || activity

	return (
		<div style={{ width: '150px' }}>
			<div className="w-full flex justify-around">
				<button>Details</button>
				<button>Activity</button>
			</div>
			{view == 'details' ? (
				<div>
					<div> Name: {name}</div>
					<div> Type: {type}</div>
					<div> Created: {created}</div>
					<div> Modified: {modified}</div>
					<div> Last Accessed: {lastAccessed}</div>
					<div> Owner: {owner}</div>
				</div>
			) : (
				<div>activity</div>
			)}
		</div>
	);
};

export default DetailsPane;
