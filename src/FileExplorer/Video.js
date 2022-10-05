const Video = ({ URL, ext }) => {
	return (
		<video
			// className="w-50 h-50"
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
