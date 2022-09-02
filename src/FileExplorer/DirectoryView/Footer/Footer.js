import { useEffect, useState } from 'react';

const itemCount = 5;
const selected = 1;
const size = '3.06 KB';
const className = 'px-2';
const Footer = () => {
	return (
		<div className="flex">
			<div className={className}>{itemCount} items</div>
			<div className={className}>{selected} item selected</div>
			<div className={className}>{size}</div>
		</div>
	);
};

export default Footer;
