export interface DataSourceAdapter {
  testConnection(config: object): Promise<boolean>;
  getTables(config: object): Promise<string[]>;
  getTableSchema(config: object, tableName: string): Promise<object[]>;
  executeQuery(config: object, query: string, params?: any[]): Promise<any[]>;
}
