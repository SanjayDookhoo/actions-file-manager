import { GraphQLClient } from 'graphql-request';
import axios from 'axios';

const graphql_endpoint = 'http://localhost:8080/v1/graphql';
const file_endpoint = 'http://localhost:5000';
const token = JSON.parse(localStorage.getItem('profile'))?.token;

// graphql mutation Login or Signup is of the 'anonymous' role and requires not authorization
const graphql_headers = !token
	? {}
	: {
			authorization: `Bearer ${token}`,
	  };
const graphQLClient = new GraphQLClient(graphql_endpoint, {
	headers: graphql_headers,
});

// https://stackoverflow.com/questions/51794553/how-do-i-create-configuration-for-axios-for-default-request-headers-in-every-htt
const axiosClientFiles = axios.create({
	baseURL: file_endpoint,
	headers: {
		'Content-Type': 'multipart/form-data; charset=utf-8',
		authorization: `Bearer ${token}`,
	},
});

const axiosClientJSON = axios.create({
	baseURL: file_endpoint,
	headers: {
		'Content-Type': 'application/json',
		authorization: `Bearer ${token}`,
	},
});

export { graphQLClient, axiosClientFiles, axiosClientJSON };
