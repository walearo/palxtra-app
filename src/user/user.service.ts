import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { KYC } from './entities/kyc.entity';
import { KycStatus } from './entities/user-entity.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(KYC)
    private kycRepository: Repository<KYC>
  ) {}

  async getUsers(): Promise<User[]> {
    return this.userRepository.find({ relations: ['profile', 'kyc'] });
  }

  async getUsersWithPendingKyc(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['kyc'],
      where: {
        kyc: {
          status: KycStatus.PENDING,
        },
      },
    });
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getKycStatus(userId: string): Promise<{ status: string }> {
    const kyc = await this.kycRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!kyc) {
      throw new NotFoundException('KYC record not found');
    }

    return { status: kyc.status };
  }
}
