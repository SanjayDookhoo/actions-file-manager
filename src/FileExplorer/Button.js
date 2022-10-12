const Button = ({ className = '', ...otherProps }) => {
	return (
		<button
			className={'px-2 py-1 w-fit border border-gray-300 rounded ' + className}
			{...otherProps}
		></button>
	);
};

export default Button;
