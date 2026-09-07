import { Controller, Get } from '@nestjs/common';
import { FilesService } from './files.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get()
  list(@TenantOrg() orgId: string) {
    return this.filesService.list(orgId);
  }
}
