import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import type { IdParam } from '../common/validation/zod-schemas';
import { idParamSchema } from '../common/validation/zod-schemas';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import { JournalService } from './journal.service';
import {
  CreateJournalDto,
  createJournalSchema,
} from './dto/create-journal.dto';
import type { JournalQueryDto } from './dto/journal-query.dto';
import { journalQuerySchema } from './dto/journal-query.dto';
import {
  UpdateJournalDto,
  updateJournalSchema,
} from './dto/update-journal.dto';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  create(
    @Body(zodPipe(createJournalSchema)) createJournalDto: CreateJournalDto,
  ) {
    return this.journalService.create(createJournalDto);
  }

  @Get()
  findAll(@Query(zodPipe(journalQuerySchema)) query: JournalQueryDto) {
    return this.journalService.findAll(query);
  }

  @Get('today')
  findToday() {
    return this.journalService.findToday();
  }

  @Get(':id')
  findOne(@Param(zodPipe(idParamSchema)) params: IdParam) {
    return this.journalService.findOne(params.id);
  }

  @Patch(':id')
  update(
    @Param(zodPipe(idParamSchema)) params: IdParam,
    @Body(zodPipe(updateJournalSchema)) updateJournalDto: UpdateJournalDto,
  ) {
    return this.journalService.update(params.id, updateJournalDto);
  }

  @Delete(':id')
  remove(@Param(zodPipe(idParamSchema)) params: IdParam) {
    return this.journalService.remove(params.id);
  }
}
