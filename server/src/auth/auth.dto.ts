import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  username: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  displayName?: string;

  @IsIn(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';

  /** Optional explicit password; a strong one is generated when omitted. */
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(64)
  password?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(60)
  displayName?: string;

  @IsIn(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
