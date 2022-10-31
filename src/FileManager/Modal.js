import { useLayoutEffect, useRef } from 'react';

const Modal = ({ modal, setModal }) => {
	const {
		isOpen,
		component: ModalComponent = DefaultComponent,
		htmlStr,
		componentProps,
		onClose,
	} = modal ?? {};
	const ref = useRef();

	useLayoutEffect(() => {
		if (isOpen) {
			ref.current.insertAdjacentHTML('beforeend', htmlStr);
		}
	}, [htmlStr, isOpen]);

	const handleClose = () => {
		setModal(null);
		if (onClose) {
			onClose();
		}
	};

	return (
		<>
			{isOpen && (
				<div
					className="absolute left-0 top-0 w-full h-full flex justify-center items-center z-10"
					ref={ref}
					style={{ backgroundColor: '#000000DD' }}
					onClick={handleClose}
				>
					<ModalComponent {...componentProps} handleClose={handleClose} />
				</div>
			)}
		</>
	);
};
export default Modal;

const DefaultComponent = () => {
	return <></>;
};
