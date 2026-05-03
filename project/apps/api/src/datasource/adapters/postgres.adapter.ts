import { Injectable } from '@nestjs/common';
import { DataSourceAdapter } from './adapter.interface';

@Injectable()
export class PostgresAdapter implements DataSourceAdapter {
  async testConnection(config: any): Promise<boolean> {
    const { Pool } = require('pg');
    const pool = new Pool(config);
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    } finally {
      await pool.end();
    }
  }

  async getTables(config: any): Promise<string[]> {
    const { Pool } = require('pg');
    const pool = new Pool(config);
    try {
      const result = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      return result.rows.map(r => r.table_name);
    } finally {
      await pool.end();
    }
  }

  async getTableSchema(config: any, tableName: string): Promise<object[]> {
    const { Pool } = require('pg');
    const pool = new Pool(config);
    try {
      const result = await pool.query(
        'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1',
        [tableName]
      );
      return result.rows;
    } finally {
      await pool.end();
    }
  }

  async executeQuery(config: any, query: string, params?: any[]): Promise<any[]> {
    const { Pool } = require('pg');
    const pool = new Pool(config);
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } finally {
      await pool.end();
    }
  }
}
