import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { KYC } from './entities/kyc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, KYC])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
