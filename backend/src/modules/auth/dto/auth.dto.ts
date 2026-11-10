import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsEmail, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Tên đăng nhập' })
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({ example: 'Admin@123456', description: 'Mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'customer2', description: 'Tên đăng nhập' })
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên' })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @ApiProperty({ example: 'customer2@gmail.com', description: 'Email cá nhân' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại', required: false })
  phone?: string;

  @ApiProperty({ example: 'Password@123', description: 'Mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'customer2@gmail.com', description: 'Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Mã xác thực OTP 6 số' })
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'Mã OTP phải gồm 6 chữ số' })
  otp: string;
}

export class VerifyMfaDto {
  @ApiProperty({ example: 'mfa-challenge-uuid', description: 'Challenge Token MFA' })
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ example: '654321', description: 'Mã OTP 2FA 6 số' })
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'Mã OTP phải gồm 6 chữ số' })
  otp: string;
}

