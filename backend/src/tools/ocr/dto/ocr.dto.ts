import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum OcrLanguage {
  ENG = 'eng',
  IND = 'ind',
}

export enum OcrOutputFormat {
  TXT = 'TXT',
  PDF = 'PDF',
}

export class OcrDto {
  @ApiProperty({ description: 'ID of the file to OCR (must be an image or PDF)' })
  @IsString()
  inputFileId: string;

  @ApiPropertyOptional({ enum: OcrLanguage, default: OcrLanguage.ENG })
  @IsEnum(OcrLanguage)
  @IsOptional()
  language?: OcrLanguage;

  @ApiPropertyOptional({ enum: OcrOutputFormat, default: OcrOutputFormat.TXT })
  @IsEnum(OcrOutputFormat)
  @IsOptional()
  format?: OcrOutputFormat;
}
