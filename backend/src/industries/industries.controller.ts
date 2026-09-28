import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body 
} from '@nestjs/common';
import { IndustriesService } from './industries.service';
import { ApplyIndustryDto } from './dto/apply-industry.dto';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  /**
   * List all available industry presets and their templates
   */
  @Get()
  getAll() {
    return {
      success: true,
      data: this.industriesService.getAllIndustries(),
    };
  }

  /**
   * Get the active industry vertical configuration saved in the database for this organization
   */
  @Get('current')
  async getCurrent(@TenantOrg() orgId: string) {
    const result = await this.industriesService.getCurrentOrganizationIndustry(orgId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get template details for a specific industry by ID
   */
  @Get(':id')
  getById(@Param('id') id: string) {
    return {
      success: true,
      data: this.industriesService.getIndustryById(id),
    };
  }

  /**
   * Apply and permanently save an industry template to the database for this organization.
   * Auto-provisions custom fields, deals, web forms, and audit logs.
   */
  @Post('apply')
  async apply(
    @TenantOrg() orgId: string,
    @Body() dto: ApplyIndustryDto,
  ) {
    const result = await this.industriesService.applyIndustryTemplate(orgId, dto);
    return {
      success: true,
      message: `Industry template applied and saved to database successfully.`,
      data: result,
    };
  }
}
