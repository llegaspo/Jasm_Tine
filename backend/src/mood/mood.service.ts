import { Injectable } from '@nestjs/common';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';

@Injectable()
export class MoodService {
  create(createMoodDto: CreateMoodDto) {
    return 'This action adds a new mood';
  }

  findAll() {
    return `This action returns all mood`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mood`;
  }

  update(id: number, updateMoodDto: UpdateMoodDto) {
    return `This action updates a #${id} mood`;
  }

  remove(id: number) {
    return `This action removes a #${id} mood`;
  }
}
