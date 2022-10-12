// style will also be parameter passed in that specifies what uses the hexcolors as need be
const TagHexColor = ({ Tag = 'div', className, children, ...otherProps }) => {
	return (
		<Tag className={className} style={{ backgroundColor: 'white' }}>
			<Tag className={className} {...otherProps}>
				{children}
			</Tag>
		</Tag>
	);
};
