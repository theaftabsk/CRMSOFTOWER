import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class ApplyIndustryDto {
  @IsString()
  @IsNotEmpty()
  industry_id: string; // e.g. 'real_estate', 'travel_tourism', 'education', etc.

  @IsOptional()
  @IsString()
  target_monthly_revenue?: string; // e.g. '₹50,00,000'

  @IsOptional()
  @IsArray()
  pipeline_stages?: Array<{
    id: number;
    name: string;
    probability: number;
    description?: string;
  }>;

  @IsOptional()
  @IsBoolean()
  seed_sample_deals?: boolean; // default true to populate 1-2 realistic deals

  @IsOptional()
  @IsBoolean()
  seed_custom_fields?: boolean; // default true to create industry fields

  @IsOptional()
  @IsBoolean()
  seed_webform?: boolean; // default true to create ready-to-embed form
}
