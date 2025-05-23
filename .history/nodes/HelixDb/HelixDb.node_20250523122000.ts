import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

// Import HelixDB client
// @ts-ignore
import HelixDB from 'helix-ts';

export class HelixDb implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HelixDB',
		name: 'helixDb',
		icon: 'file:helixdb.svg',
		group: ['database'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with HelixDB - the time-series database for modern applications',
		defaults: {
			name: 'HelixDB',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'helixDbApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Record',
						value: 'record',
						description: 'Work with records in HelixDB',
					},
					{
						name: 'Vector',
						value: 'vector',
						description: 'Work with vectors in HelixDB',
					},
					{
						name: 'Raw Query',
						value: 'rawQuery',
						description: 'Execute raw HelixQL queries',
					},
				],
				default: 'record',
			},
			// Record Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['record'],
					},
				},
				options: [
					{
						name: 'Insert',
						value: 'insert',
						description: 'Insert a new record',
						action: 'Insert a record',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record by ID',
						action: 'Get a record',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing record',
						action: 'Update a record',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record',
						action: 'Delete a record',
					},
				],
				default: 'insert',
			},
			// Vector Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['vector'],
					},
				},
				options: [
					{
						name: 'Insert Vector',
						value: 'insertVector',
						description: 'Insert a new vector',
						action: 'Insert a vector',
					},
					{
						name: 'Search Vectors',
						value: 'searchVectors',
						description: 'Search for similar vectors',
						action: 'Search vectors',
					},
					{
						name: 'Delete Vector',
						value: 'deleteVector',
						description: 'Delete a vector',
						action: 'Delete a vector',
					},
				],
				default: 'insertVector',
			},
			// Raw Query Operation
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['rawQuery'],
					},
				},
				options: [
					{
						name: 'Run HelixQL',
						value: 'runHelixQL',
						description: 'Execute a raw HelixQL query',
						action: 'Run helix ql query',
					},
				],
				default: 'runHelixQL',
				description: 'Execute raw HelixQL queries',
			},
			// Common fields for record operations
			{
				displayName: 'Table Name',
				name: 'tableName',
				type: 'string',
				default: '',
				placeholder: 'users',
				description: 'Name of the table to operate on',
				displayOptions: {
					show: {
						resource: ['record'],
					},
				},
			},
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				default: '',
				description: 'ID of the record',
				displayOptions: {
					show: {
						resource: ['record'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},
			{
				displayName: 'Record Data',
				name: 'recordData',
				type: 'json',
				default: '{}',
				description: 'Record data as JSON object',
				displayOptions: {
					show: {
						resource: ['record'],
						operation: ['insert', 'update'],
					},
				},
			},
			// Vector fields
			{
				displayName: 'Collection Name',
				name: 'collectionName',
				type: 'string',
				default: '',
				placeholder: 'embeddings',
				description: 'Name of the vector collection',
				displayOptions: {
					show: {
						resource: ['vector'],
					},
				},
			},
			{
				displayName: 'Vector ID',
				name: 'vectorId',
				type: 'string',
				default: '',
				description: 'ID of the vector',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['deleteVector'],
					},
				},
			},
			{
				displayName: 'Vector Data',
				name: 'vectorData',
				type: 'json',
				default: '[]',
				description: 'Vector data as JSON array of numbers',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['insertVector', 'searchVectors'],
					},
				},
			},
			{
				displayName: 'Vector Metadata',
				name: 'vectorMetadata',
				type: 'json',
				default: '{}',
				description: 'Optional metadata for the vector',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['insertVector'],
					},
				},
			},
			{
				displayName: 'Search Limit',
				name: 'searchLimit',
				type: 'number',
				default: 10,
				description: 'Maximum number of results to return',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['searchVectors'],
					},
				},
			},
			// Raw query fields
			{
				displayName: 'HelixQL Query',
				name: 'helixqlQuery',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				placeholder: 'QUERY getUsers() => users <- N<User> RETURN users',
				description: 'The HelixQL query to execute',
				displayOptions: {
					show: {
						resource: ['rawQuery'],
					},
				},
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParameters',
				type: 'json',
				default: '{}',
				description: 'Parameters for the HelixQL query as JSON object',
				displayOptions: {
					show: {
						resource: ['rawQuery'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('helixDbApi');

		// Create HelixDB client with proper URL
		const helixDbUrl = `http://${credentials.host}:${credentials.port}`;
		const client = new HelixDB(helixDbUrl);

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let result: any;

				switch (`${resource}:${operation}`) {
					case 'record:insert': {
						const tableName = this.getNodeParameter('tableName', i) as string;
						const recordData = this.getNodeParameter('recordData', i) as object;
						result = await client.query('insertRecord', {
							table: tableName,
							data: recordData,
						});
						break;
					}
					case 'record:get': {
						const tableName = this.getNodeParameter('tableName', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;
						result = await client.query('getRecord', {
							table: tableName,
							id: recordId,
						});
						break;
					}
					case 'record:update': {
						const tableName = this.getNodeParameter('tableName', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;
						const recordData = this.getNodeParameter('recordData', i) as object;
						result = await client.query('updateRecord', {
							table: tableName,
							id: recordId,
							data: recordData,
						});
						break;
					}
					case 'record:delete': {
						const tableName = this.getNodeParameter('tableName', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;
						result = await client.query('deleteRecord', {
							table: tableName,
							id: recordId,
						});
						break;
					}
					case 'vector:insertVector': {
						const collectionName = this.getNodeParameter('collectionName', i) as string;
						const vectorData = this.getNodeParameter('vectorData', i) as number[];
						const vectorMetadata = this.getNodeParameter('vectorMetadata', i) as object;
						result = await client.query('insertVector', {
							collection: collectionName,
							vector: vectorData,
							metadata: vectorMetadata,
						});
						break;
					}
					case 'vector:searchVectors': {
						const collectionName = this.getNodeParameter('collectionName', i) as string;
						const vectorData = this.getNodeParameter('vectorData', i) as number[];
						const searchLimit = this.getNodeParameter('searchLimit', i) as number;
						result = await client.query('searchVectors', {
							collection: collectionName,
							vector: vectorData,
							limit: searchLimit,
						});
						break;
					}
					case 'vector:deleteVector': {
						const collectionName = this.getNodeParameter('collectionName', i) as string;
						const vectorId = this.getNodeParameter('vectorId', i) as string;
						result = await client.query('deleteVector', {
							collection: collectionName,
							id: vectorId,
						});
						break;
					}
					case 'rawQuery:runHelixQL': {
						const helixqlQuery = this.getNodeParameter('helixqlQuery', i) as string;
						const queryParameters = this.getNodeParameter('queryParameters', i) as object;
						result = await client.query(helixqlQuery, queryParameters);
						break;
					}
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported operation: ${resource}:${operation}`,
							{ itemIndex: i }
						);
				}

				returnData.push({
					json: result,
					pairedItem: i,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: i,
						error,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
} 