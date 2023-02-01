import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  login: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  profileImage?: string | null;

  @IsString()
  email: string;

  admin: boolean = false;
}
