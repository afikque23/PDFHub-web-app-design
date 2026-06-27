import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.adminService.getUsers(Number(page), Number(limit));
  }

  @Get('files')
  getFiles(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.adminService.getFiles(Number(page), Number(limit));
  }

  @Get('jobs')
  getJobs(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.adminService.getJobs(Number(page), Number(limit));
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
