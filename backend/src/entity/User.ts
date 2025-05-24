import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, Length } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Length(4, 20)
  username: string;

  @Column()
  @Length(6, 100)
  password: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user', 'guest'],
    default: 'user'
  })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: any;

  @Column({ type: 'bigint', default: 0 })
  storageQuota: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 