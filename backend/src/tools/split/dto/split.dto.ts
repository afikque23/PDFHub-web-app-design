import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export enum SplitMode {
  ALL = 'ALL',
  RANGE = 'RANGE',
  CUSTOM = 'CUSTOM',
}

export class SplitDto {
  @ApiProperty({ description: 'ID of the file to split' })
  @IsString()
  inputFileId: string;

  @ApiProperty({ enum: SplitMode, description: 'Mode of splitting' })
  @IsEnum(SplitMode)
  mode: SplitMode;

  @ApiPropertyOptional({ description: 'Range of pages to extract e.g. 1-5' })
  @IsString()
  @IsOptional()
  range?: string;

  @ApiPropertyOptional({ type: [Number], description: 'Specific pages to extract e.g. [1, 3, 5]' })
  @IsArray()
  @IsOptional()
  pages?: number[];
}
