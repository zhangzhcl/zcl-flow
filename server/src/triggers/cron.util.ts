/**
 * Minimal, dependency-free 5-field cron parser and matcher.
 *
 * Supported syntax: `minute hour dayOfMonth month dayOfWeek`
 *   *          any value
 *   a          exact value
 *   a-b        inclusive range
 *   a,b,c      list (each item may be a range or step)
 *   * / n      step over the whole range
 *   a-b/n      step over a range
 *
 * Aliases: @hourly @daily @midnight @weekly @monthly @yearly
 * dayOfWeek: 0 or 7 = Sunday.
 *
 * Resolution is one minute, which matches the scheduler heartbeat.
 */

interface FieldSpec {
  min: number;
  max: number;
  label: string;
}

const FIELDS: FieldSpec[] = [
  { min: 0, max: 59, label: 'minute' },
  { min: 0, max: 23, label: 'hour' },
  { min: 1, max: 31, label: 'day of month' },
  { min: 1, max: 12, label: 'month' },
  { min: 0, max: 7, label: 'day of week' },
];

const ALIASES: Record<string, string> = {
  '@hourly': '0 * * * *',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@weekly': '0 0 * * 0',
  '@monthly': '0 0 1 * *',
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
};

/** A parsed expression: one allow-set of numbers per field. */
export interface ParsedCron {
  readonly expression: string;
  readonly minutes: Set<number>;
  readonly hours: Set<number>;
  readonly daysOfMonth: Set<number>;
  readonly months: Set<number>;
  readonly daysOfWeek: Set<number>;
  /** True when the field was a bare `*` — needed for cron's dom/dow OR rule. */
  readonly domIsWildcard: boolean;
  readonly dowIsWildcard: boolean;
}

function parseField(raw: string, spec: FieldSpec): { values: Set<number>; wildcard: boolean } {
  const values = new Set<number>();
  const wildcard = raw === '*';

  for (const part of raw.split(',')) {
    const token = part.trim();
    if (!token) {
      throw new Error(`Invalid ${spec.label} field: empty item in "${raw}"`);
    }

    const [rangePart, stepPart] = token.split('/');
    let step = 1;
    if (stepPart !== undefined) {
      step = Number(stepPart);
      if (!Number.isInteger(step) || step <= 0) {
        throw new Error(`Invalid ${spec.label} step "${stepPart}"`);
      }
    }

    let from: number;
    let to: number;
    if (rangePart === '*') {
      from = spec.min;
      to = spec.max;
    } else if (rangePart.includes('-')) {
      const [a, b] = rangePart.split('-');
      from = Number(a);
      to = Number(b);
    } else {
      from = Number(rangePart);
      to = stepPart !== undefined ? spec.max : from;
    }

    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      throw new Error(`Invalid ${spec.label} value "${rangePart}"`);
    }
    if (from < spec.min || to > spec.max || from > to) {
      throw new Error(
        `${spec.label} value out of range: "${rangePart}" (allowed ${spec.min}-${spec.max})`,
      );
    }

    for (let value = from; value <= to; value += step) {
      values.add(value);
    }
  }

  return { values, wildcard };
}

/** Parses a cron expression, throwing a descriptive error when invalid. */
export function parseCron(input: string): ParsedCron {
  const trimmed = (input ?? '').trim();
  if (!trimmed) {
    throw new Error('Cron expression is required');
  }

  const expression = ALIASES[trimmed.toLowerCase()] ?? trimmed;
  const parts = expression.split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `Cron expression must have 5 fields (minute hour day month weekday), received ${parts.length}`,
    );
  }

  const [minute, hour, dom, month, dow] = parts.map((part, index) =>
    parseField(part, FIELDS[index]),
  );

  // Normalise Sunday: cron accepts both 0 and 7.
  if (dow.values.has(7)) {
    dow.values.delete(7);
    dow.values.add(0);
  }

  return {
    expression: trimmed,
    minutes: minute.values,
    hours: hour.values,
    daysOfMonth: dom.values,
    months: month.values,
    daysOfWeek: dow.values,
    domIsWildcard: dom.wildcard,
    dowIsWildcard: dow.wildcard,
  };
}

/** Returns true when `date` (minute precision) satisfies the expression. */
export function cronMatches(parsed: ParsedCron, date: Date): boolean {
  if (!parsed.minutes.has(date.getMinutes())) return false;
  if (!parsed.hours.has(date.getHours())) return false;
  if (!parsed.months.has(date.getMonth() + 1)) return false;

  const domMatch = parsed.daysOfMonth.has(date.getDate());
  const dowMatch = parsed.daysOfWeek.has(date.getDay());

  // Standard cron rule: when both day fields are restricted the match is an OR.
  if (parsed.domIsWildcard && parsed.dowIsWildcard) return true;
  if (parsed.domIsWildcard) return dowMatch;
  if (parsed.dowIsWildcard) return domMatch;
  return domMatch || dowMatch;
}

/**
 * Computes the next matching timestamp after `from`, scanning minute by minute.
 * Bounded to ~2 years so a nonsensical (but valid) expression cannot hang.
 */
export function nextCronRun(parsed: ParsedCron, from: Date = new Date()): Date | null {
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const limit = 366 * 24 * 60 * 2;
  for (let i = 0; i < limit; i += 1) {
    if (cronMatches(parsed, cursor)) return cursor;
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return null;
}

/** Validates an expression, returning the error message or null when valid. */
export function validateCron(input: string): string | null {
  try {
    parseCron(input);
    return null;
  } catch (error: any) {
    return String(error?.message ?? error);
  }
}
