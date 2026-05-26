import { IsString, IsOptional, IsInt, IsBoolean, IsObject } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  workspaceId: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @IsString()
  @IsOptional()
  icon?: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;
}

export class MoveDocumentDto {
  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsInt()
  position: number;
}
