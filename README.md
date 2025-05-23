# n8n-nodes-helixdb

This is an n8n community node that provides integration with HelixDB - the time-series database for modern applications.

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Package Name

```
n8n-nodes-helixdb
```

## Features

This node provides comprehensive integration with HelixDB through three main resource types:

### 📊 Record Operations
- **Insert**: Add new records to HelixDB tables
- **Get**: Retrieve records by ID
- **Update**: Modify existing records
- **Delete**: Remove records from tables

### 🔍 Vector Operations
- **Insert Vector**: Add vector embeddings to collections
- **Search Vectors**: Find similar vectors using semantic search
- **Delete Vector**: Remove vectors from collections

### 📝 Raw Query Operations
- **Run HelixQL**: Execute custom HelixQL queries directly

## Credentials

The node requires HelixDB API credentials with the following configuration:

- **Host**: HelixDB server hostname or IP address (default: localhost)
- **Port**: HelixDB server port (default: 6969)
- **Authentication Type**: 
  - None (no authentication)
  - Username & Password (basic auth)
  - Bearer Token (token-based auth)

## Usage Examples

### Insert a Record

```json
{
  "resource": "record",
  "operation": "insert",
  "tableName": "users",
  "recordData": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }
}
```

### Search Vectors

```json
{
  "resource": "vector",
  "operation": "searchVectors",
  "collectionName": "embeddings",
  "vectorData": [0.1, 0.2, 0.3, 0.4, 0.5],
  "searchLimit": 10
}
```

### Run Custom HelixQL Query

```json
{
  "resource": "rawQuery",
  "operation": "runHelixQL",
  "helixqlQuery": "QUERY getUsers() => users <- N<User> RETURN users",
  "queryParameters": {}
}
```

## Development

This node was built following the [n8n community node development guidelines](https://docs.n8n.io/integrations/creating-nodes/).

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
npm run lintfix
```

### Dependencies

- **helix-ts**: Official TypeScript client for HelixDB
- **n8n-workflow**: n8n workflow types and utilities

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [HelixDB Documentation](https://docs.helix-db.com)
- [HelixDB TypeScript Client](https://github.com/HelixDB/helix-ts)

## License

MIT

## Version History

### 0.1.0
- Initial release
- Record operations (insert, get, update, delete)
- Vector operations (insert, search, delete)
- Raw HelixQL query execution
- Authentication support (none, basic, bearer token)
- Full TypeScript support
