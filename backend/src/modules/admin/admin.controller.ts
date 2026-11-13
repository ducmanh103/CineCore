import { Controller, Get, Patch, Param, ParseIntPipe, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Lấy các chỉ số KPI thống kê tổng quan hệ thống' })
  async getDashboard() {
    return this.adminService.getDashboardKpis();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Báo cáo doanh thu 12 tháng và phân bổ kênh thanh toán' })
  async getRevenue(@Query('year') year?: number) {
    return this.adminService.getRevenueAnalytics(year ? Number(year) : undefined);
  }

  @Get('users')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Quản lý danh sách người dùng' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/status')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Khóa / Mở khóa người dùng' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto.status);
  }
}

