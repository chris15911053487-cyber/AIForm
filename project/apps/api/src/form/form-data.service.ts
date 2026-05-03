import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormData } from './entities/form-data.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class FormDataService {
  constructor(
    @InjectRepository(FormData) private dataRepo: Repository<FormData>,
  ) {}

  async findAll(formId: string, pagination: PaginationDto): Promise<PaginatedResult<FormData>> {
    const [items, total] = await this.dataRepo.findAndCount({
      where: { formId },
      skip: ((pagination.page || 1) - 1) * (pagination.pageSize || 20),
      take: pagination.pageSize || 20,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page: pagination.page || 1, pageSize: pagination.pageSize || 20, totalPages: Math.ceil(total / (pagination.pageSize || 20)) };
  }

  async findOne(id: string): Promise<FormData> {
    const data = await this.dataRepo.findOne({ where: { id } });
    if (!data) throw new NotFoundException('表单数据不存在');
    return data;
  }

  async create(dto: Partial<FormData>): Promise<FormData> {
    return this.dataRepo.save(this.dataRepo.create(dto));
  }

  async update(id: string, dto: Partial<FormData>): Promise<FormData> {
    const data = await this.findOne(id);
    Object.assign(data, dto);
    return this.dataRepo.save(data);
  }

  async delete(id: string): Promise<void> {
    const result = await this.dataRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('表单数据不存在');
  }
}
