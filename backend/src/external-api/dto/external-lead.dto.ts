import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class ExternalLeadDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  source?: string; // e.g. "Partner App", "WordPress Site", "Zapier"

  @IsOptional()
  @IsNumber()
  expected_value?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
