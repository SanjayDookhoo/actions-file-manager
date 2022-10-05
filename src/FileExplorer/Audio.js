const Audio = ({ URL, ext }) => {
	return (
		<audio
			// className="w-50 h-50"
			controls
			autoPlay
			preload="metadata"
			src={URL}
			type={`audio/${ext}`}
			onClick={(e) => e.stopPropagation()}
		/>
	);
};

export default Audio;
