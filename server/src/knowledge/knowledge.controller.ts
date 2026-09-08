import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { KnowledgeService } from './knowledge.service';
import { AddDocumentDto, CreateKnowledgeBaseDto } from './knowledge.dto';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly svc: KnowledgeService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Post()
  create(@Body() dto: CreateKnowledgeBaseDto) {
    return this.svc.create(dto);
  }

  /**
   * Serves stored images for chunk content references. Stays behind the auth
   * guard — clients append `?access_token=` (same convention as SSE) so
   * `<img>` tags can load them without headers. Long-lived cache: asset ids
   * are content-addressed, so a file never changes once written.
   */
  @Get('assets/:assetId/file')
  async assetFile(@Param('assetId') assetId: string, @Res() res: Response) {
    const file = await this.svc.getAssetFile(assetId);
    if (!file) throw new NotFoundException(`Asset ${assetId} not found`);
    res
      .set('Content-Type', file.mimeType)
      .set('Cache-Control', 'private, max-age=31536000, immutable')
      .set('X-Content-Type-Options', 'nosniff')
      .send(file.bytes);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post(':id/documents')
  addDocument(@Param('id') id: string, @Body() dto: AddDocumentDto) {
    return this.svc.addDocument(id, dto);
  }

  @Get(':id/chunks')
  listChunks(@Param('id') id: string) {
    return this.svc.listChunks(id);
  }

  @Delete(':id/chunks')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearChunks(@Param('id') id: string) {
    return this.svc.clearChunks(id);
  }

  @Delete(':id/chunks/:chunkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteChunk(@Param('chunkId') chunkId: string) {
    return this.svc.deleteChunk(chunkId);
  }
}
