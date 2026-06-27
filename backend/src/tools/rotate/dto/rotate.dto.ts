import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsArray, IsOptional } from 'class-validator';

export class RotateDto {
  @ApiProperty({ description: 'ID of the file to rotate' })
  @IsString()
  inputFileId: string;

  @ApiProperty({ description: 'Rotation angle: 90, 180, or 270' })
  @IsIn([90, 180, 270])
  angle: number;

  @ApiPropertyOptional({ type: [Number], description: 'Specific pages to rotate (1-indexed). Leave empty for all.' })
  @IsArray()
  @IsOptional()
  pages?: number[];
}
