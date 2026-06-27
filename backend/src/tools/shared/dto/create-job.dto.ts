import { IsString, IsNotEmpty, IsArray, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobPriority } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ description: 'The tool to use (e.g., COMPRESS, SPLIT, MERGE)' })
  @IsString()
  @IsNotEmpty()
  tool: string;

  @ApiProperty({ description: 'Array of storage paths from pdfhub-input', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  inputFileIds: string[];

  @ApiProperty({ description: 'Priority of the job', enum: JobPriority, default: JobPriority.NORMAL })
  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority;

  @ApiProperty({ description: 'Specific options for the tool (e.g., angle, compressionLevel)', required: false })
  @IsOptional()
  @IsObject()
  options?: any;
}

