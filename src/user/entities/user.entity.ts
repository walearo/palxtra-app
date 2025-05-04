import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { KYC } from './kyc.entity';
import { UserRole } from './user-entity.enum';
import { Profile } from './profile.entity';
import { AuthToken } from '../../auth/entities/auth.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneNumberVerified: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToOne(() => KYC, (kyc) => kyc.user, { cascade: true })
  kyc: KYC;

  @OneToMany(() => AuthToken, (token) => token.user)
  tokens: AuthToken[];
}
