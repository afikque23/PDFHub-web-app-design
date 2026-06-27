import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum CompressionLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CompressDto {
  @ApiProperty({ description: 'ID of the file to compress' })
  @IsString()
  inputFileId: string;

  @ApiPropertyOptional({ enum: CompressionLevel, default: CompressionLevel.MEDIUM })
  @IsEnum(CompressionLevel)
  @IsOptional()
  compressionLevel?: CompressionLevel;
}
