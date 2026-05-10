import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import { MoodService } from './mood.service';
import { CreateMoodDto, createMoodLogSchema } from './dto/create-mood.dto';
import type { MoodLogQueryDto } from './dto/update-mood.dto';
import { moodLogQuerySchema } from './dto/update-mood.dto';

@Controller('mood-logs')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  save(@Body(zodPipe(createMoodLogSchema)) createMoodDto: CreateMoodDto) {
    return this.moodService.save(createMoodDto);
  }

  @Get()
  findAll(@Query(zodPipe(moodLogQuerySchema)) query: MoodLogQueryDto) {
    return this.moodService.findAll(query);
  }

  @Get('summary')
  summary(@Query(zodPipe(moodLogQuerySchema)) query: MoodLogQueryDto) {
    return this.moodService.summary(query);
  }
}
