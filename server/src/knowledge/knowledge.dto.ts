import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateKnowledgeBaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  embeddingModelConfigId?: string;

  @IsString()
  @IsOptional()
  chunkSeparator?: string;

  @IsInt()
  @Min(100)
  @IsOptional()
  chunkSize?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  chunkOverlap?: number;

  @IsBoolean()
  @IsOptional()
  preprocessWhitespace?: boolean;

  @IsBoolean()
  @IsOptional()
  preprocessUrls?: boolean;

  @IsString()
  @IsOptional()
  searchMode?: 'vector' | 'fulltext' | 'hybrid';

  @IsInt()
  @Min(1)
  @IsOptional()
  topK?: number;

  @IsNumber()
  @IsOptional()
  scoreThreshold?: number;
}

export class KnowledgeImageDto {
  /** Reference path as written inside the document content (e.g. attachments/doc/01.png). */
  @IsString()
  path: string;

  /** Raw image bytes encoded as base64. */
  @IsString()
  data: string;

  @IsString()
  mimeType: string;
}

export class AddDocumentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  sourceTitle?: string;

  @IsString()
  @IsOptional()
  metadata?: string;

  @IsArray()
  @IsOptional()
  images?: KnowledgeImageDto[];
}
