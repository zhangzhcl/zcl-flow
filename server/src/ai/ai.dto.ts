import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GenerateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  prompt: string;
}
