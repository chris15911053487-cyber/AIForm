import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormDefinition } from './entities/form-definition.entity';
import { FormData } from './entities/form-data.entity';
import { FormService } from './form.service';
import { FormDataService } from './form-data.service';
import { FieldTypeService } from './field-type.service';
import { FormController } from './form.controller';
import { FormDataController } from './form-data.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FormDefinition, FormData])],
  controllers: [FormController, FormDataController],
  providers: [FormService, FormDataService, FieldTypeService],
  exports: [FormService, FormDataService, FieldTypeService],
})
export class FormModule {}
