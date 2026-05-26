import { IsString, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';

export class CreateMindmapDto {
  @IsString()
  workspaceId: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;
}

export class UpdateMindmapDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;
}

export class CreateMindmapNodeDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @IsOptional()
  position?: number;
}

export class UpdateMindmapNodeDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string | null;

  @IsBoolean()
  @IsOptional()
  collapsed?: boolean;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  parentId?: string | null;
}
