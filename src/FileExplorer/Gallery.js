import { useState, useEffect } from 'react';
import { axiosClientJSON } from './endpoint';
import { buttonStyle } from './utils/constants';

const Gallery = ({ imageGalleryOrdered, record }) => {
	const [currIndex, setCurrIndex] = useState(-1);
	const [src, setSrc] = useState('');

	useEffect(() => {
		const index = imageGalleryOrdered.findIndex((item) => item.id == record.id);
		setCurrIndex(index);
	}, [imageGalleryOrdered, record]);

	useEffect(() => {
		if (currIndex != -1) {
			const { id } = imageGalleryOrdered[currIndex];
			axiosClientJSON({
				url: '/downloadFile',
				method: 'POST',
				data: {
					id,
				},
			}).then((res) => {
				const { URL } = res.data;
				setSrc(URL);
			});
		}
	}, [currIndex]);

	const handleLeft = (e) => {
		e.stopPropagation();
		const newCurrIndex = currIndex - 1;
		if (newCurrIndex >= 0) {
			setCurrIndex(newCurrIndex);
		}
	};

	const handleRight = (e) => {
		e.stopPropagation();
		const newCurrIndex = currIndex + 1;
		if (newCurrIndex < imageGalleryOrdered.length) {
			setCurrIndex(newCurrIndex);
		}
	};

	const isLeftDisabled = () => {
		const newCurrIndex = currIndex - 1;
		if (newCurrIndex >= 0) {
			return false;
		}
		return true;
	};

	const isRightDisabled = () => {
		const newCurrIndex = currIndex + 1;
		if (newCurrIndex < imageGalleryOrdered.length) {
			return false;
		}
		return true;
	};

	return (
		<div className="w-full h-full flex justify-between items-center">
			<Arrow icon="west" onClick={handleLeft} disabled={isLeftDisabled()} />
			{currIndex != -1 && (
				<img
					// className={className}
					style={{ maxWidth: 'calc(100% - 104px)' }} // (32px + 16px) * 2, where 32px is size of arrow and 16px is the total extra margin
					onClick={(e) => e.stopPropagation()}
					src={src}
				/>
			)}
			<Arrow icon="east" onClick={handleRight} disabled={isRightDisabled()} />
		</div>
	);
};

export default Gallery;

const Arrow = ({ icon, disabled, ...otherProps }) => {
	return (
		<div
			className={
				'bg-gray-800 rounded-full m-2 ' +
				(disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer')
			}
			{...otherProps}
		>
			<span className={buttonStyle}>{icon}</span>
		</div>
	);
};
