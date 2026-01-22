import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MoodService } from './mood.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';

@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  create(@Body() createMoodDto: CreateMoodDto) {
    return this.moodService.create(createMoodDto);
  }

  @Get()
  findAll() {
    return this.moodService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moodService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMoodDto: UpdateMoodDto) {
    return this.moodService.update(+id, updateMoodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moodService.remove(+id);
  }
}
