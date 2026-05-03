import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormDefinition } from './entities/form-definition.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(FormDefinition) private formRepo: Repository<FormDefinition>,
  ) {}

  async findAll(tenantId: string, pagination: PaginationDto): Promise<PaginatedResult<FormDefinition>> {
    const [items, total] = await this.formRepo.findAndCount({
      where: { tenantId },
      skip: ((pagination.page || 1) - 1) * (pagination.pageSize || 20),
      take: pagination.pageSize || 20,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page: pagination.page || 1, pageSize: pagination.pageSize || 20, totalPages: Math.ceil(total / (pagination.pageSize || 20)) };
  }

  async findOne(id: string): Promise<FormDefinition> {
    const form = await this.formRepo.findOne({ where: { id } });
    if (!form) throw new NotFoundException('表单不存在');
    return form;
  }

  async create(dto: Partial<FormDefinition>): Promise<FormDefinition> {
    return this.formRepo.save(this.formRepo.create(dto));
  }

  async update(id: string, dto: Partial<FormDefinition>): Promise<FormDefinition> {
    const form = await this.findOne(id);
    Object.assign(form, dto);
    form.version += 1;
    return this.formRepo.save(form);
  }

  async delete(id: string): Promise<void> {
    const result = await this.formRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('表单不存在');
  }
}
