import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { KycStatus } from './user-entity.enum';

@Entity()
export class KYC {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  idNumber: string;

  @Column({ nullable: true })
  idType: string;

  @Column({ nullable: true })
  idUploadUrl: string;

  @Column({ nullable: true })
  AddressProofType: string;

  @Column({ nullable: true })
  AddressProofUrl: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
  })
  status: KycStatus;

  @Column({ nullable: true })
  submissionDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
