const Modal = ({ modal, setModal }) => {
	const {
		isOpen,
		component: ModalComponent = <></>,
		componentProps,
		onClose,
	} = modal ?? {};

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
