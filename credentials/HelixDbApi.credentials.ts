import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HelixDbApi implements ICredentialType {
	name = 'helixDbApi';
	displayName = 'HelixDB API';
	documentationUrl = 'https://docs.helix-db.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'localhost',
			placeholder: 'localhost',
			description: 'The hostname or IP address of your HelixDB server',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 6969,
			description: 'The port number for your HelixDB server (default: 6969)',
		},
		{
			displayName: 'Authentication Type',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'None',
					value: 'none',
				},
				{
					name: 'Username & Password',
					value: 'basic',
				},
				{
					name: 'Bearer Token',
					value: 'bearer',
				},
			],
			default: 'none',
			description: 'Authentication method to use for connecting to HelixDB',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authType: ['basic'],
				},
			},
			description: 'Username for HelixDB authentication',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authType: ['basic'],
				},
			},
			description: 'Password for HelixDB authentication',
		},
		{
			displayName: 'Bearer Token',
			name: 'bearerToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authType: ['bearer'],
				},
			},
			description: 'Bearer token for HelixDB authentication',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.authType === "bearer" ? "Bearer " + $credentials.bearerToken : undefined}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}:{{$credentials.port}}',
			url: '/health',
			method: 'GET',
		},
	};
} 