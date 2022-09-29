import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import reactToWebcomponent from 'react-to-webcomponent';

// normal development beginning
const props = {
	height: '100vh',
	width: '100%',
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	// https://github.com/atlassian/react-beautiful-dnd/issues/2396#issuecomment-1131658703
	// <React.StrictMode>
	<App {...props} />
	// </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// normal development end

// creating custom element beginning
// customElements.define(
// 	'file-manager',
// 	reactToWebcomponent(App, React, ReactDOM)
// );
// creating custom element end
