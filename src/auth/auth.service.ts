import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Profile } from '../user/entities/profile.entity';
import { KYC } from '../user/entities/kyc.entity';
import { AuthToken } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(KYC)
    private kycRepository: Repository<KYC>,

    @InjectRepository(AuthToken)
    private authTokenRepository: Repository<AuthToken>
  ) {}

  async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    const existingProfile = await this.profileRepository.findOne({
      where: { phoneNumber },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    if (existingProfile) {
      throw new ConflictException('Phone number already in use');
    }

    const newUser = this.userRepository.create({
      email,
      password,
    });
    const savedUser = await this.userRepository.save(newUser);

    const newProfile = this.profileRepository.create({
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      user: savedUser,
    });
    await this.profileRepository.save(newProfile);

    const newKyc = this.kycRepository.create({
      user: savedUser,
    });
    await this.kycRepository.save(newKyc);

    return savedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.saveRefreshToken(user, refreshToken);

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(user: User, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const authToken = this.authTokenRepository.create({
      token,
      user,
      expiresAt,
    });

    await this.authTokenRepository.save(authToken);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const authToken = await this.authTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!authToken || authToken.user.id !== userId) {
      throw new Error('Invalid refresh token');
    }

    return this.generateTokens(authToken.user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authTokenRepository.delete({ token: refreshToken });
  }
}
