import axios from 'axios';

const fileExtensionEndpoint = 'https://extension.actions-file-manager.dev';
export const assetsEndpoint = 'https://assets.actions-file-manager.dev';

const axiosClientFileExtension = axios.create({
	baseURL: fileExtensionEndpoint,
	validateStatus: function (status) {
		return status === 200 || status === 400; // prevents promise.all from throwing an error if extension cant be found
	},
	// headers: {
	// 	'Content-Type': 'application/json',
	// },
});

export { axiosClientFileExtension };
