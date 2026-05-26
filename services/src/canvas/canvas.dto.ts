import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  ValidateNested,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CanvasObjectType } from '@prisma/client';

export class CreateCanvasDto {
  @IsString()
  workspaceId: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;
}

export class UpdateCanvasDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;
}

export class CreateCanvasObjectDto {
  @IsEnum(CanvasObjectType)
  type: CanvasObjectType;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  rotation?: number;

  @IsObject()
  @IsOptional()
  props?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  zIndex?: number;

  @IsString()
  @IsOptional()
  groupId?: string;
}

export class UpdateCanvasObjectDto {
  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  rotation?: number;

  @IsNumber()
  @IsOptional()
  scaleX?: number;

  @IsNumber()
  @IsOptional()
  scaleY?: number;

  @IsObject()
  @IsOptional()
  props?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  zIndex?: number;

  @IsString()
  @IsOptional()
  groupId?: string | null;
}

export class BulkUpdateCanvasObjectDto {
  @IsString()
  id: string;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  rotation?: number;

  @IsNumber()
  @IsOptional()
  scaleX?: number;

  @IsNumber()
  @IsOptional()
  scaleY?: number;

  @IsObject()
  @IsOptional()
  props?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  zIndex?: number;
}

export class BulkUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateCanvasObjectDto)
  updates: BulkUpdateCanvasObjectDto[];
}

export class BulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  objectIds: string[];
}
