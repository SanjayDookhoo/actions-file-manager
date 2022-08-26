import React, {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

const ContextActionsContext = createContext();

export const ContextActionsProvider = ({ children }) => {
	const [actionDetails, setActionDetails] = useState(null);
	const [componentPosition, setComponentPosition] = useState(null);
	const [componentDetails, setComponentDetails] = useState(null);
	const componentRef = useRef();
	const containerRef = useRef();
	/*
	{
		event
		Component,
		relativeTo: mouse, target
		if mouse
			yAxis: top, bottom, center, relative
			xAxis: left, right, center, relative
		if target
			location: left, right, top, bottom / relative
			position: beginning, end, center
			padding: <number> // numerical value of pixels that seperates the Component from the menu
	}
	*/

	const value = { actionDetails, setActionDetails };

	const handleOnClick = (e) => {
		setComponentPosition(null);
	};

	useLayoutEffect(() => {
		if (actionDetails) {
			setComponentDetails(componentRef.current.getBoundingClientRect());
		}
	}, [actionDetails]);

	useEffect(() => {
		if (actionDetails) {
			const { event, relativeTo, xAxis, yAxis, location, position, padding } =
				actionDetails;

			// determining top and left to position the component as the user desires
			let top = 0;
			let left = 0;
			if (relativeTo == 'mouse') {
				if (yAxis == 'top') {
					top = event.pageY;
				} else if (yAxis == 'bottom') {
					top = event.pageY - componentDetails.height;
				} else if (yAxis == 'center') {
					top = event.pageY - Math.floor(componentDetails.height / 2);
				}

				if (xAxis == 'left') {
					left = event.pageX;
				} else if (xAxis == 'right') {
					left = event.pageX - componentDetails.width;
				} else if (xAxis == 'center') {
					left = event.pageX - Math.floor(componentDetails.width / 2);
				}
			} else if (relativeTo == 'target') {
				const targetDetails = event.target.getBoundingClientRect();
				if (location == 'top' || location == 'bottom') {
					if (position == 'beginning') {
						left = targetDetails.left;
					} else if (position == 'end') {
						left = targetDetails.right - componentDetails.width;
					} else if (position == 'center') {
						left =
							targetDetails.left +
							Math.floor(targetDetails.width / 2) -
							Math.floor(componentDetails.width / 2);
					}
				}

				if (location == 'left' || location == 'right') {
					if (position == 'beginning') {
						top = targetDetails.top;
					} else if (position == 'end') {
						top = targetDetails.bottom - componentDetails.height;
					} else if (position == 'center') {
						top =
							targetDetails.top +
							Math.floor(targetDetails.height / 2) -
							Math.floor(componentDetails.height / 2);
					}
				}
				if (location == 'top') {
					top = targetDetails.top - componentDetails.height - padding;
				} else if (location == 'right') {
					left = targetDetails.right + padding;
				} else if (location == 'bottom') {
					top = targetDetails.bottom + padding;
				} else if (location == 'left') {
					left = targetDetails.left - componentDetails.width - padding;
				}
			} else {
				top = event.pageY;
				left = event.pageX;
			}

			// if the component overflows outside the container of ContextActions, try to reposition in a way that it is fully visible

			const bottom = top + componentDetails.height;
			const right = left + componentDetails.width;
			const containerDetails = containerRef.current.getBoundingClientRect();
			// only one each of this is to execute, in case there is no space no matter what is done
			if (top < 0) {
				top = 0;
			} else if (bottom > containerDetails.height) {
				top -= bottom - containerDetails.height;
			}
			// only one each of this is to execute, in case there is no space no matter what is done
			if (left < 0) {
				left = 0;
			} else if (right > containerDetails.width) {
				left -= right - containerDetails.width;
			}

			// set final position
			setComponentPosition({
				top,
				left,
			});
		}
	}, [componentDetails]);

	return (
		<ContextActionsContext.Provider value={value}>
			<div ref={containerRef} onClick={handleOnClick} className="relative">
				{children}
				<div
					ref={componentRef}
					className="absolute"
					style={{
						top: componentPosition?.top,
						left: componentPosition?.left,
						visibility: componentPosition ? 'initial' : 'hidden',
					}}
				>
					{actionDetails?.Component}
				</div>
			</div>
		</ContextActionsContext.Provider>
	);
};

export const useAction = () => {
	const { actionDetails, setActionDetails } = useContext(ContextActionsContext);

	return (params) => {
		const { event, Component, relativeTo, xAxis, yAxis, location, position } =
			params;
		if (!event || !Component) return;

		if (relativeTo == 'mouse' && !(xAxis && yAxis)) {
			return;
		} else if (relativeTo == 'target' && !(location && position)) {
			return;
		}

		event.stopPropagation();

		setActionDetails(params);
	};
};
