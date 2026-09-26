import { IsString, IsEmail, IsOptional, IsNumber, IsObject } from 'class-validator';

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
  source?: string; // e.g. "Website Contact Form", "Landing Page", "Partner App", "WordPress"

  @IsOptional()
  @IsNumber()
  expected_value?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  message?: string; // Contact form message / inquiry details

  @IsOptional()
  @IsString()
  service_interest?: string; // e.g. "Enterprise Plan", "Consultation"

  @IsOptional()
  @IsString()
  website_url?: string; // Origin website URL

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  utm_source?: string;

  @IsOptional()
  @IsString()
  utm_medium?: string;

  @IsOptional()
  @IsString()
  utm_campaign?: string;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;
}

