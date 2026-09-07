import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  industry!: string;

  @IsOptional()
  website?: string;

  @IsOptional()
  @IsNumber()
  annual_revenue?: number;

  @IsOptional()
  @IsNumber()
  employee_count?: number;

  @IsOptional()
  billing_address?: string;
}
