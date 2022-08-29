import React, {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

const ContextActionsContext = createContext();

const all = {
	xAxis: ['left', 'center', 'right'],
	yAxis: ['top', 'center', 'bottom'],
	location: ['left', 'right', 'top', 'bottom'],
	position: ['end', 'center', 'beginning'],
};

export const ContextActionsProvider = ({ children }) => {
	const [actionDetails, setActionDetails] = useState(null);
	const [componentPosition, setComponentPosition] = useState(null);
	const [componentDetails, setComponentDetails] = useState(null);
	const componentRef = useRef();
	const containerRef = useRef();

	const value = { actionDetails, setActionDetails };

	const removeContextMenu = () => {
		setComponentPosition(null);
	};

	useEffect(() => {
		// if page has lost focus in anyway, remove context menu
		// https://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
		// setInterval(() => {
		// 	if (!document.hasFocus()) {
		// 		setComponentPosition(null);
		// 	}
		// }, 500);
		// setInterval(() => {
		// 	if (!document.hasFocus()) {
		// 		alert('fuck');
		// 	}
		// }, 500);

		// TODO: find another way to removeContextMenu when this is implemented as a web component, where this can be called if stopPropagation is known to have been used when an onClick event was created
		window.removeContextMenu = removeContextMenu;

		// remove context menu if any type of click is detected, where stopPropagation isnt used
		// window.addEventListener('click', removeContextMenu);
		// return () => {
		// 	window.removeEventListener('click', removeContextMenu);
		// };
	}, []);

	useLayoutEffect(() => {
		if (actionDetails) {
			setComponentDetails(componentRef.current.getBoundingClientRect());
		}
	}, [actionDetails]);

	useEffect(() => {
		if (actionDetails) {
			let { event, relativeTo, xAxis, yAxis, location, position, padding } =
				actionDetails;
			const containerDetails = containerRef.current.getBoundingClientRect();

			// determining top and left to position the component as the user desires
			let top = 0;
			let left = 0;
			if (relativeTo == 'mouse') {
				const yAxisCalc = () => {
					if (yAxis == 'bottom') {
						top = event.pageY;
					} else if (yAxis == 'top') {
						top = event.pageY - componentDetails.height;
					} else if (yAxis == 'center') {
						top = event.pageY - Math.floor(componentDetails.height / 2);
					}
				};
				yAxisCalc();
				while (top < 0) {
					const index = all.yAxis.indexOf(yAxis) + 1;
					if (index == all.yAxis.length) break;
					yAxis = all.yAxis[index];
					yAxisCalc();
				}

				while (top + componentDetails.height > containerDetails.height) {
					// top + componentDetails.height = bottom
					const index = all.yAxis.indexOf(yAxis) - 1;
					if (index == -1) break;
					yAxis = all.yAxis[index];
					yAxisCalc();
				}

				const xAxisCalc = () => {
					if (xAxis == 'right') {
						left = event.pageX;
					} else if (xAxis == 'left') {
						left = event.pageX - componentDetails.width;
					} else if (xAxis == 'center') {
						left = event.pageX - Math.floor(componentDetails.width / 2);
					}
				};
				xAxisCalc();

				while (left < 0) {
					const index = all.xAxis.indexOf(xAxis) + 1;
					if (index == all.xAxis.length) break;
					xAxis = all.xAxis[index];
					xAxisCalc();
				}

				while (left + componentDetails.width > containerDetails.width) {
					// left + componentDetails.width = left
					const index = all.xAxis.indexOf(xAxis) - 1;
					if (index == -1) break;
					xAxis = all.xAxis[index];
					xAxisCalc();
				}
			} else if (relativeTo == 'target') {
				const calcStuff = () => {
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
				};
				calcStuff();

				// //////////////

				if (location == 'top' || location == 'bottom') {
					while (left < 0) {
						const index = all.position.indexOf(position) + 1;
						if (index == all.position.length) break;
						position = all.position[index];
						calcStuff();
					}

					while (left + componentDetails.width > containerDetails.width) {
						// left + componentDetails.width = left
						const index = all.position.indexOf(position) - 1;
						if (index == -1) break;
						position = all.position[index];
						calcStuff();
					}
				}

				if (location == 'left' || location == 'right') {
					while (top < 0) {
						const index = all.position.indexOf(position) + 1;
						if (index == all.position.length) break;
						position = all.position[index];
						calcStuff();
					}

					while (top + componentDetails.height > containerDetails.height) {
						// top + componentDetails.height = bottom
						const index = all.position.indexOf(position) - 1;
						if (index == -1) break;
						position = all.position[index];
						calcStuff();
					}
				}

				if (location == 'top' || location == 'bottom') {
					if (top < 0) {
						location = 'bottom';
					} else if (top + componentDetails.height > containerDetails.height) {
						location = 'top';
					}
				}

				if (location == 'right' || location == 'left') {
					if (left + componentDetails.width > containerDetails.width) {
						location = 'left';
					} else if (left < 0) {
						location = 'right';
					}
				}
				calcStuff();
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
			<div ref={containerRef} className="relative">
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

	return {
		newAction: (params) => {
			let { event, Component, relativeTo, xAxis, yAxis, location, position } =
				params;
			if (!event || !Component) return;

			if (relativeTo == 'mouse' && !(xAxis && yAxis)) {
				return;
			} else if (relativeTo == 'target' && !(location && position)) {
				return;
			}

			// set default behavior
			if (!relativeTo) {
				relativeTo = 'mouse';
				xAxis = 'right';
				yAxis = 'bottom';
			}

			event.stopPropagation();

			setActionDetails(params);
		},
		refreshAction: (params) => {
			const { componentName } = params;

			if (actionDetails?.componentName == componentName) {
				setActionDetails({
					...actionDetails,
					...params,
				});
			}
		},
	};
};
