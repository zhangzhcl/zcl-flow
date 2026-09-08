import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DebugConfig, DebugSession, DebugSessionService } from './debug-session';
import { ExecutionQueueService } from './execution-queue.service';
import { CurrentUser } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';

/**
 * Interactive control surface for debug runs.
 *
 * A debug run is enqueued like any async run; the engine registers a
 * DebugSession for it, and these endpoints drive that session (pause / step /
 * continue / stop / live-update breakpoints and mocks). Routes live under
 * `/executions/:id/debug` and are distinct in depth or literal segment from the
 * ExecutionsController routes, so there is no match conflict.
 */
@Controller('executions')
export class DebugController {
  constructor(
    private readonly debugSessions: DebugSessionService,
    private readonly queue: ExecutionQueueService,
  ) {}

  /** Resolves the caller's session or 404s (unknown / not owned / finished). */
  private getSession(id: string, user: JwtPayload): DebugSession {
    const session = this.debugSessions.get(id);
    if (!session || session.ownerId !== user.sub) {
      throw new NotFoundException('No active debug session for this execution');
    }
    return session;
  }

  /** Current pause / breakpoint / mock / snapshot state of the debug run. */
  @Get(':id/debug')
  state(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.getSession(id, user).getState();
  }

  /** Executes exactly one more node, then pauses again. */
  @Post(':id/debug/step')
  @HttpCode(200)
  step(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    this.getSession(id, user).step();
    return { ok: true };
  }

  /** Runs freely until the next breakpoint (or the end). */
  @Post(':id/debug/continue')
  @HttpCode(200)
  continueRun(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    this.getSession(id, user).continueRun();
    return { ok: true };
  }

  /**
   * Stops the debug run. Rejecting the gate unwinds a paused run; aborting the
   * queue signal additionally interrupts a node that is mid-flight.
   */
  @Post(':id/debug/stop')
  @HttpCode(200)
  async stop(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const session = this.getSession(id, user);
    session.stop();
    await this.queue.cancel(id);
    return { ok: true };
  }

  /** Live-updates breakpoints and mocks while the run is in flight. */
  @Patch(':id/debug')
  update(
    @Param('id') id: string,
    @Body() config: DebugConfig,
    @CurrentUser() user: JwtPayload,
  ) {
    const session = this.getSession(id, user);
    session.update(config ?? {});
    return session.getState();
  }
}
