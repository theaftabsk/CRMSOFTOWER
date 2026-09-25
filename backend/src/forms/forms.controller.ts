import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { FormsService } from './forms.service';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  findAll(@Headers('x-org-id') orgId: string = 'ORG001') {
    return this.formsService.findAll(orgId);
  }

  @Get(':id')
  findOne(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.formsService.findOne(orgId, id);
  }

  @Get(':id/submissions')
  getSubmissions(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.formsService.getSubmissions(orgId, id);
  }

  @Get(':id/analytics')
  getAnalytics(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.formsService.getAnalytics(orgId, id);
  }

  @Post()
  create(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Body() data: any,
  ) {
    return this.formsService.create(orgId, data);
  }

  @Post(':id/duplicate')
  duplicate(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.formsService.duplicate(orgId, id);
  }

  @Put(':id')
  update(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.formsService.update(orgId, id, data);
  }

  @Patch(':id/toggle')
  toggle(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.formsService.toggleActive(orgId, id);
  }

  @Delete(':id')
  delete(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.formsService.delete(orgId, id);
  }
}
