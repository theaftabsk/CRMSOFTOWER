import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  search(@TenantOrg() orgId: string, @Query('q') query: string) {
    return this.searchService.globalSearch(orgId, query);
  }
}
