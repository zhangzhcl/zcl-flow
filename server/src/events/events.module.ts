import { Global, Module } from '@nestjs/common';
import { ExecutionEventsService } from './execution-events.service';

/**
 * Global so both the engine (producer) and the executions controller
 * (consumer) share a single event bus instance.
 */
@Global()
@Module({
  providers: [ExecutionEventsService],
  exports: [ExecutionEventsService],
})
export class EventsModule {}
