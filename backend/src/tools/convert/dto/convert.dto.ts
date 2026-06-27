import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class JpgToPdfDto {
  @ApiProperty({ type: [String], description: 'Array of JPG image file IDs' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  inputFileIds: string[];
}

export class PdfToJpgDto {
  @ApiProperty({ description: 'ID of the PDF file to convert' })
  @IsString()
  inputFileId: string;

  @ApiPropertyOptional({ description: 'DPI for image extraction', default: 300 })
  @IsNumber()
  @IsOptional()
  dpi?: number;

  @ApiPropertyOptional({ description: 'Quality of jpeg', default: 80 })
  @IsNumber()
  @IsOptional()
  quality?: number;
}

export class WordToPdfDto {
  @ApiProperty({ description: 'ID of the Word document (.docx/.doc)' })
  @IsString()
  inputFileId: string;
}

export class PdfToWordDto {
  @ApiProperty({ description: 'ID of the PDF to convert to Word' })
  @IsString()
  inputFileId: string;
}
