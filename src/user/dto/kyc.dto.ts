import { IsString, IsNotEmpty, MinLength, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @IsString()
  @IsNotEmpty()
  idType: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string; // expects ISO8601 date strings (e.g., "2023-05-01")
}
