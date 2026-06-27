import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum WatermarkPosition {
  CENTER = 'CENTER',
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
}

export class WatermarkDto {
  @ApiProperty({ description: 'ID of the file to watermark' })
  @IsString()
  inputFileId: string;

  @ApiPropertyOptional({ description: 'Text to use as watermark' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: 'File ID of the image to use as watermark' })
  @IsString()
  @IsOptional()
  imageFileId?: string;

  @ApiPropertyOptional({ description: 'Opacity from 0.0 to 1.0', default: 0.5 })
  @IsNumber()
  @IsOptional()
  opacity?: number;

  @ApiPropertyOptional({ enum: WatermarkPosition, default: WatermarkPosition.CENTER })
  @IsEnum(WatermarkPosition)
  @IsOptional()
  position?: WatermarkPosition;

  @ApiPropertyOptional({ description: 'Font size for text watermark', default: 48 })
  @IsNumber()
  @IsOptional()
  fontSize?: number;

  @ApiPropertyOptional({ description: 'Rotation angle for watermark', default: 45 })
  @IsNumber()
  @IsOptional()
  rotation?: number;
}
