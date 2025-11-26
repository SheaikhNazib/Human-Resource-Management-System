import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../models/user.entity';
import { Roles } from 'src/common/guards/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly repo: Repository<Users>,
  ) {}

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id } });
  }

  async findOneByEmailAndRole(email: string, role: Roles) {
    return await this.repo.findOne({ where: { email, role } });
  }

  async create(userData: Partial<Users>) {
    const user = this.repo.create(userData);
    return await this.repo.save(user);
  }

  async findAll() {
    return await this.repo.find();
  }

  async update(id: number, updateData: Partial<Users>) {
    await this.repo.update(id, updateData);
    return await this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

