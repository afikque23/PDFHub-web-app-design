import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UploadLogInterceptor } from '../common/interceptors/upload-log.interceptor';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'), UploadLogInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.filesService.upload(user.id, file);
  }

  @Get()
  @ApiOperation({ summary: 'List user files' })
  @ApiResponse({ status: 200, description: 'Returns a list of files' })
  async listFiles(@CurrentUser() user: any) {
    if (user.role === 'ADMIN') {
      return this.filesService.findAll();
    }
    return this.filesService.findUserFiles(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details' })
  async getFile(@Param('id') id: string, @CurrentUser() user: any) {
    const file = await this.filesService.findById(id);
    if (user.role !== 'ADMIN' && file.userId !== user.id) {
      throw new NotFoundException('File tidak ditemukan');
    }
    return file;
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get signed URL to download file' })
  async downloadFile(@Param('id') id: string, @CurrentUser() user: any) {
    const url = await this.filesService.getDownloadUrl(id, user.id, user.role === 'ADMIN');
    return { url };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a file' })
  async deleteFile(@Param('id') id: string, @CurrentUser() user: any) {
    await this.filesService.delete(id, user.id, user.role === 'ADMIN');
    return { message: 'File berhasil dihapus' };
  }

  @Post(':id/restore')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Restore a deleted file (Admin only)' })
  async restoreFile(@Param('id') id: string, @CurrentUser() user: any) {
    await this.filesService.restore(id, user.id, true);
    return { message: 'File berhasil dipulihkan' };
  }
}
