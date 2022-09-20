import { GraphQLClient } from 'graphql-request';
import axios from 'axios';

export const backendEndpointWS = 'ws://localhost:5000';
const backendEndpoint = 'http://localhost:5000';
const fileExtensionEndpoint = 'http://localhost:4000';
const token = JSON.parse(localStorage.getItem('profile'))?.token;

// https://stackoverflow.com/questions/51794553/how-do-i-create-configuration-for-axios-for-default-request-headers-in-every-htt
const axiosClientFiles = axios.create({
	baseURL: backendEndpoint,
	headers: {
		'Content-Type': 'multipart/form-data; charset=utf-8',
		authorization: `Bearer ${token}`,
	},
});

const axiosClientJSON = axios.create({
	baseURL: backendEndpoint,
	headers: {
		'Content-Type': 'application/json',
		authorization: `Bearer ${token}`,
	},
});
const axiosClientFileExtension = axios.create({
	baseURL: fileExtensionEndpoint,
	validateStatus: function (status) {
		return status == 200 || status == 400; // prevents promise.all from throwing an error if extension cant be found
	},
	// headers: {
	// 	'Content-Type': 'application/json',
	// },
});

export { axiosClientFiles, axiosClientJSON, axiosClientFileExtension };
