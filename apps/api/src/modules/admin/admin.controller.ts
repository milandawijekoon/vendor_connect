import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@vendorconnect/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ListVendorsAdminDto } from './dto/list-vendors-admin.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';

@ApiTags('admin')
@ApiBearerAuth('jwt')
@Roles(Role.ADMIN)
@ApiUnauthorizedResponse()
@ApiForbiddenResponse()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform statistics', description: 'Aggregated counts: vendors by status, total users, inquiries, reviews.' })
  @ApiOkResponse({ description: 'Stats returned.' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('vendors')
  @ApiOperation({ summary: 'List vendors (admin)', description: 'All vendors with owner details. Filter by status to review the approval queue.' })
  @ApiOkResponse({ description: 'Paginated vendor list.' })
  listVendors(@Query() dto: ListVendorsAdminDto) {
    return this.adminService.listVendors(dto);
  }

  @Patch('vendors/:id/status')
  @ApiOperation({ summary: 'Update vendor status', description: 'Approve, reject, suspend, or reinstate a vendor.' })
  @ApiParam({ name: 'id', description: 'Vendor profile ID' })
  @ApiOkResponse({ description: 'Status updated.' })
  @ApiNotFoundResponse()
  updateVendorStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.adminService.updateVendorStatus(id, dto);
  }
}
