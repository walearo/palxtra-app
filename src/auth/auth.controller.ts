import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password, phoneNumber } = createUserDto;
    return this.authService.registerUser(
      firstName,
      lastName,
      email,
      password,
      phoneNumber
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }

  @Post('refresh')
  async refresh(@Body() refreshData: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(
      refreshData.userId,
      refreshData.refreshToken
    );
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    await this.authService.logout(body.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
