const Video = ({ URL, ext }) => {
	return (
		<video
			// className="w-50 h-50"
			style={{
				maxWidth: 'calc(100% - 104px)',
				maxHeight: 'calc(100% - 104px)',
			}} // using same styling as Gallery component
			controls
			autoPlay
			preload="metadata"
			src={URL}
			type={`video/${ext}`}
			onClick={(e) => e.stopPropagation()}
		/>
	);
};

export default Video;
