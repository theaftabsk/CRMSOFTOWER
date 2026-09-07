import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ConvertLeadDto {
  @IsNotEmpty()
  leadId!: string;

  @IsNotEmpty()
  dealTitle!: string;

  @IsNumber()
  dealValue!: number;

  @IsOptional()
  dealStage?: string;
}
