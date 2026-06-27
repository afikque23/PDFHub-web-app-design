import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class MergeDto {
  @ApiProperty({ type: [String], description: 'Array of file IDs to merge' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  inputFileIds: string[];
}
