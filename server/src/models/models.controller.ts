import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ModelsService } from './models.service';
import { CreateModelConfigDto, UpdateModelConfigDto } from './model-config.dto';
import { AdminOnly } from '../auth/auth.guard';

/**
 * Model providers are centrally managed: every signed-in user can list them
 * (to pick one inside an LLM node), but only administrators may create,
 * modify or delete configurations and their API keys.
 */
@Controller('models')
export class ModelsController {
  constructor(private readonly models: ModelsService) {}

  @Get()
  findAll() {
    return this.models.findAll();
  }

  @AdminOnly()
  @Post()
  create(@Body() dto: CreateModelConfigDto) {
    return this.models.create(dto);
  }

  @AdminOnly()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModelConfigDto) {
    return this.models.update(id, dto);
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.models.remove(id);
  }

  @AdminOnly()
  @Post(':id/default')
  setDefault(@Param('id') id: string) {
    return this.models.setDefault(id);
  }

  @AdminOnly()
  @Post(':id/test')
  test(@Param('id') id: string) {
    return this.models.testConnection(id);
  }
}
