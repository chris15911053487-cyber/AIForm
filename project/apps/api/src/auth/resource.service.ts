import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource) private resourceRepo: Repository<Resource>,
  ) {}

  async findAll(tenantId: string, pagination: PaginationDto): Promise<PaginatedResult<Resource>> {
    const [items, total] = await this.resourceRepo.findAndCount({
      where: { tenantId },
      skip: ((pagination.page || 1) - 1) * (pagination.pageSize || 20),
      take: pagination.pageSize || 20,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return {
      items,
      total,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 20,
      totalPages: Math.ceil(total / (pagination.pageSize || 20)),
    };
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('资源不存在');
    return resource;
  }

  async create(dto: Partial<Resource>): Promise<Resource> {
    const exists = await this.resourceRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('资源编码已存在');
    return this.resourceRepo.save(this.resourceRepo.create(dto));
  }

  async update(id: string, dto: Partial<Resource>): Promise<Resource> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('资源不存在');
    Object.assign(resource, dto);
    return this.resourceRepo.save(resource);
  }

  async delete(id: string): Promise<void> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('资源不存在');
    await this.resourceRepo.remove(resource);
  }
}
