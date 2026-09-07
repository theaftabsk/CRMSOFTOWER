import { IsNotEmpty, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  company!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  source?: string;

  @IsOptional()
  assigned_to?: string;

  @IsOptional()
  @IsNumber()
  expected_value?: number;

  @IsOptional()
  notes?: string;
}
