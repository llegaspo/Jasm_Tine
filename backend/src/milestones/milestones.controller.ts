import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { IdParam } from '../common/validation/zod-schemas';
import { idParamSchema } from '../common/validation/zod-schemas';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import {
  CreateMilestoneDto,
  createMilestoneSchema,
} from './dto/create-milestone.dto';
import {
  UpdateMilestoneDto,
  updateMilestoneSchema,
} from './dto/update-milestone.dto';
import { MilestonesService } from './milestones.service';

@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Get()
  findAll() {
    return this.milestonesService.findAll();
  }

  @Post()
  create(
    @Body(zodPipe(createMilestoneSchema))
    createMilestoneDto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(createMilestoneDto);
  }

  @Patch(':id')
  update(
    @Param(zodPipe(idParamSchema)) params: IdParam,
    @Body(zodPipe(updateMilestoneSchema))
    updateMilestoneDto: UpdateMilestoneDto,
  ) {
    return this.milestonesService.update(params.id, updateMilestoneDto);
  }

  @Delete(':id')
  remove(@Param(zodPipe(idParamSchema)) params: IdParam) {
    return this.milestonesService.remove(params.id);
  }
}
