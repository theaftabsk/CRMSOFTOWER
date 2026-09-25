import { IsString, IsArray, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  key_name: string;

  @IsArray()
  permissions: string[]; // e.g. ['leads:read', 'leads:write', 'deals:read']

  @IsOptional()
  @IsNumber()
  @Min(10)
  rate_limit_per_min?: number;

  @IsOptional()
  @IsString()
  expires_at?: string;

  @IsOptional()
  @IsArray()
  allowed_domains?: string[];
}
