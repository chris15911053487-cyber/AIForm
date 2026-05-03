import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from './entities/data-source.entity';
import { PostgresAdapter } from './adapters/postgres.adapter';

@Injectable()
export class DatasourceService {
  constructor(
    @InjectRepository(DataSource) private dsRepo: Repository<DataSource>,
    private pgAdapter: PostgresAdapter,
  ) {}

  async findAll(tenantId: string): Promise<DataSource[]> {
    return this.dsRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DataSource> {
    const ds = await this.dsRepo.findOne({ where: { id } });
    if (!ds) throw new NotFoundException('数据源不存在');
    return ds;
  }

  async create(dto: Partial<DataSource>): Promise<DataSource> {
    return this.dsRepo.save(this.dsRepo.create(dto));
  }

  async update(id: string, dto: Partial<DataSource>): Promise<DataSource> {
    const ds = await this.findOne(id);
    Object.assign(ds, dto);
    return this.dsRepo.save(ds);
  }

  async delete(id: string): Promise<void> {
    const result = await this.dsRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('数据源不存在');
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const ds = await this.findOne(id);
    if (ds.type !== 'postgresql') throw new BadRequestException('仅支持PostgreSQL');
    const success = await this.pgAdapter.testConnection(ds.config);
    return { success, message: success ? '连接成功' : '连接失败' };
  }

  async getTables(id: string): Promise<string[]> {
    const ds = await this.findOne(id);
    return this.pgAdapter.getTables(ds.config);
  }

  async previewData(id: string, tableName: string, limit = 20): Promise<any[]> {
    const ds = await this.findOne(id);
    return this.pgAdapter.executeQuery(ds.config, `SELECT * FROM "${tableName}" LIMIT $1`, [limit]);
  }
}
