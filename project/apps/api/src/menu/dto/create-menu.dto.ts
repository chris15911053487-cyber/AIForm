import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsIn,
  ValidateIf,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterFieldOptionDto {
  @IsString()
  name: string;

  code: any;
}

export class FilterFieldDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsIn(['string', 'int', 'decimal', 'date', 'datetime', 'bool'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxLength?: number;

  @IsOptional()
  @IsArray()
  @Type(() => Object)
  options?: FilterFieldOptionDto[];

  @IsOptional()
  @IsString()
  optionsSql?: string;

  @IsOptional()
  @IsBoolean()
  scan?: boolean;

  @IsOptional()
  @IsBoolean()
  noAllOption?: boolean;
}

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'disabled'])
  status?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['embed', 'dialog', 'blank'])
  openMode?: string;

  @IsOptional()
  @IsString()
  @IsIn(['builtin', 'report'])
  menuKind?: string;

  @ValidateIf((o) => o.menuKind === 'report')
  @IsString()
  queryTemplate?: string;

  @IsOptional()
  @IsArray()
  @Type(() => FilterFieldDto)
  filterSchema?: FilterFieldDto[];

  @IsOptional()
  @IsObject()
  columnLabels?: Record<string, string>;

  @IsOptional()
  @IsObject()
  columnNameMapping?: Record<string, string>;

  @IsOptional()
  @IsString()
  detailQueryTemplate?: string;

  @IsOptional()
  @IsString()
  detailKeyColumn?: string;

  @IsOptional()
  @IsString()
  detailKeyParam?: string;

  @IsOptional()
  @IsString()
  @IsIn(['string', 'int', 'decimal', 'date', 'datetime', 'bool'])
  detailKeyType?: string;

  @IsOptional()
  @IsString()
  aiPrompt?: string;
}
