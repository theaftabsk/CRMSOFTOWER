import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateDealDto {
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  account_name!: string;

  @IsOptional()
  account_id?: string;

  @IsNotEmpty()
  stage!: string;

  @IsNumber()
  value!: number;

  @IsNotEmpty()
  closing_date!: string;

  @IsNotEmpty()
  owner!: string;

  @IsOptional()
  @IsNumber()
  probability?: number;
}
