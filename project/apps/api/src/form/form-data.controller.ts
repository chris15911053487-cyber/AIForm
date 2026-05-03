import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FormDataService } from './form-data.service';
import { FormData } from './entities/form-data.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('forms/:formId/data')
export class FormDataController {
  constructor(private readonly formDataService: FormDataService) {}

  @Get()
  findAll(@Param('formId') formId: string, @Query() pagination: PaginationDto) {
    return this.formDataService.findAll(formId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formDataService.findOne(id);
  }

  @Post()
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('formId') formId: string,
    @Body() dto: Partial<FormData>,
  ) {
    dto.tenantId = tenantId;
    dto.formId = formId;
    dto.createdBy = userId;
    return this.formDataService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('userId') userId: string, @Body() dto: Partial<FormData>) {
    dto.updatedBy = userId;
    return this.formDataService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.formDataService.delete(id);
  }
}
