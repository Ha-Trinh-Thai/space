import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsString()
  documentId: string;

  @IsString()
  @IsOptional()
  anchorId?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  resolved?: boolean;
}
