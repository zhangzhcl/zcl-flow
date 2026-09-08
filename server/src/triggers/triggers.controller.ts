import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TriggersService } from './triggers.service';
import { CreateTriggerDto, UpdateTriggerDto } from './trigger.dto';
import { CurrentUser, Public } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';

@Controller('triggers')
export class TriggersController {
  constructor(private readonly triggers: TriggersService) {}

  @Get()
  list(@Query('workflowId') workflowId: string, @CurrentUser() user: JwtPayload) {
    return this.triggers.findByWorkflow(workflowId, user.sub);
  }

  @Post()
  create(@Body() dto: CreateTriggerDto, @CurrentUser() user: JwtPayload) {
    return this.triggers.create(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTriggerDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.triggers.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.triggers.remove(id, user.sub);
  }

  @Post(':id/rotate')
  rotate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.triggers.rotateToken(id, user.sub);
  }

  /** Fires the trigger immediately with its configured payload. */
  @Post(':id/fire')
  fire(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.triggers.fireNow(id, user.sub);
  }
}

/**
 * Public webhook surface. The secret token in the path is the credential,
 * so these routes are exempt from the global bearer-token guard.
 */
@Controller('hooks')
export class WebhooksController {
  constructor(private readonly triggers: TriggersService) {}

  @Public()
  @Post(':token')
  invoke(
    @Param('token') token: string,
    @Body() body: Record<string, unknown>,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.triggers.invokeWebhook(token, {
      body: body ?? {},
      // Signatures must be computed over the exact bytes received, not over a
      // re-serialised object (key order and spacing would differ).
      rawBody: request.rawBody,
      signature: firstHeader(request.headers['x-zcl-flow-signature']),
    });
  }

  /** Convenience GET form: query string becomes the workflow input. */
  @Public()
  @Get(':token')
  invokeViaGet(
    @Param('token') token: string,
    @Query() query: Record<string, unknown>,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.triggers.invokeWebhook(token, {
      body: query ?? {},
      signature: firstHeader(request.headers['x-zcl-flow-signature']),
    });
  }
}

/** Normalises a possibly-repeated header to a single string. */
function firstHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
