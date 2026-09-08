import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { AgentsService } from './agents.service';
import { ChatWithAgentDto, CreateAgentDto, CreateConversationDto, UpdateAgentDto } from './agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.agents.findAll(user.sub);
  }

  @Post()
  create(@Body() dto: CreateAgentDto, @CurrentUser() user: JwtPayload) {
    return this.agents.create(dto, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.agents.findOne(id, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentDto, @CurrentUser() user: JwtPayload) {
    return this.agents.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.agents.remove(id, user.sub);
  }

  @Get(':id/conversations')
  listConversations(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.agents.listConversations(id, user.sub);
  }

  @Post(':id/conversations')
  createConversation(
    @Param('id') id: string,
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agents.createConversation(id, dto, user.sub);
  }

  @Get(':id/conversations/:conversationId')
  getConversation(
    @Param('id') id: string,
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agents.getConversation(id, conversationId, user.sub);
  }

  @Post(':id/chat')
  chat(@Param('id') id: string, @Body() dto: ChatWithAgentDto, @CurrentUser() user: JwtPayload) {
    return this.agents.chat(id, dto, user.sub);
  }
}
