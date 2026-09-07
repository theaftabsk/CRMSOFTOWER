import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  phone!: string;

  @IsNotEmpty()
  company!: string;

  @IsOptional()
  designation?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  account_id?: string;
}
