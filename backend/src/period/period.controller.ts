import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import {
  CreatePeriodDto,
  createCycleEntrySchema,
} from './dto/create-period.dto';
import type {
  CreateSymptomLogInput,
  CycleSymptomQueryDto,
} from './dto/update-period.dto';
import {
  createSymptomLogSchema,
  cycleSymptomQuerySchema,
} from './dto/update-period.dto';
import { PeriodService } from './period.service';

@Controller('cycle')
export class PeriodController {
  constructor(private readonly periodService: PeriodService) {}

  @Post('entries')
  saveEntry(
    @Body(zodPipe(createCycleEntrySchema)) createPeriodDto: CreatePeriodDto,
  ) {
    return this.periodService.saveEntry(createPeriodDto);
  }

  @Get('summary')
  summary() {
    return this.periodService.summary();
  }

  @Post('symptoms')
  saveSymptom(
    @Body(zodPipe(createSymptomLogSchema)) symptomDto: CreateSymptomLogInput,
  ) {
    return this.periodService.saveSymptom(symptomDto);
  }

  @Get('symptoms')
  symptoms(
    @Query(zodPipe(cycleSymptomQuerySchema)) query: CycleSymptomQueryDto,
  ) {
    return this.periodService.findSymptoms(query);
  }
}
