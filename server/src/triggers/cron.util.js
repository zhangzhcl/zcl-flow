"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCron = exports.nextCronRun = exports.cronMatches = exports.parseCron = void 0;
var FIELDS = [
    { min: 0, max: 59, label: 'minute' },
    { min: 0, max: 23, label: 'hour' },
    { min: 1, max: 31, label: 'day of month' },
    { min: 1, max: 12, label: 'month' },
    { min: 0, max: 7, label: 'day of week' },
];
var ALIASES = {
    '@hourly': '0 * * * *',
    '@daily': '0 0 * * *',
    '@midnight': '0 0 * * *',
    '@weekly': '0 0 * * 0',
    '@monthly': '0 0 1 * *',
    '@yearly': '0 0 1 1 *',
    '@annually': '0 0 1 1 *',
};
function parseField(raw, spec) {
    var values = new Set();
    var wildcard = raw === '*';
    for (var _i = 0, _a = raw.split(','); _i < _a.length; _i++) {
        var part = _a[_i];
        var token = part.trim();
        if (!token) {
            throw new Error("Invalid ".concat(spec.label, " field: empty item in \"").concat(raw, "\""));
        }
        var _b = token.split('/'), rangePart = _b[0], stepPart = _b[1];
        var step = 1;
        if (stepPart !== undefined) {
            step = Number(stepPart);
            if (!Number.isInteger(step) || step <= 0) {
                throw new Error("Invalid ".concat(spec.label, " step \"").concat(stepPart, "\""));
            }
        }
        var from = void 0;
        var to = void 0;
        if (rangePart === '*') {
            from = spec.min;
            to = spec.max;
        }
        else if (rangePart.includes('-')) {
            var _c = rangePart.split('-'), a = _c[0], b = _c[1];
            from = Number(a);
            to = Number(b);
        }
        else {
            from = Number(rangePart);
            to = stepPart !== undefined ? spec.max : from;
        }
        if (!Number.isInteger(from) || !Number.isInteger(to)) {
            throw new Error("Invalid ".concat(spec.label, " value \"").concat(rangePart, "\""));
        }
        if (from < spec.min || to > spec.max || from > to) {
            throw new Error("".concat(spec.label, " value out of range: \"").concat(rangePart, "\" (allowed ").concat(spec.min, "-").concat(spec.max, ")"));
        }
        for (var value = from; value <= to; value += step) {
            values.add(value);
        }
    }
    return { values: values, wildcard: wildcard };
}
/** Parses a cron expression, throwing a descriptive error when invalid. */
function parseCron(input) {
    var _a;
    var trimmed = (input !== null && input !== void 0 ? input : '').trim();
    if (!trimmed) {
        throw new Error('Cron expression is required');
    }
    var expression = (_a = ALIASES[trimmed.toLowerCase()]) !== null && _a !== void 0 ? _a : trimmed;
    var parts = expression.split(/\s+/);
    if (parts.length !== 5) {
        throw new Error("Cron expression must have 5 fields (minute hour day month weekday), received ".concat(parts.length));
    }
    var _b = parts.map(function (part, index) {
        return parseField(part, FIELDS[index]);
    }), minute = _b[0], hour = _b[1], dom = _b[2], month = _b[3], dow = _b[4];
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
exports.parseCron = parseCron;
/** Returns true when `date` (minute precision) satisfies the expression. */
function cronMatches(parsed, date) {
    if (!parsed.minutes.has(date.getMinutes()))
        return false;
    if (!parsed.hours.has(date.getHours()))
        return false;
    if (!parsed.months.has(date.getMonth() + 1))
        return false;
    var domMatch = parsed.daysOfMonth.has(date.getDate());
    var dowMatch = parsed.daysOfWeek.has(date.getDay());
    // Standard cron rule: when both day fields are restricted the match is an OR.
    if (parsed.domIsWildcard && parsed.dowIsWildcard)
        return true;
    if (parsed.domIsWildcard)
        return dowMatch;
    if (parsed.dowIsWildcard)
        return domMatch;
    return domMatch || dowMatch;
}
exports.cronMatches = cronMatches;
/**
 * Computes the next matching timestamp after `from`, scanning minute by minute.
 * Bounded to ~2 years so a nonsensical (but valid) expression cannot hang.
 */
function nextCronRun(parsed, from) {
    if (from === void 0) { from = new Date(); }
    var cursor = new Date(from.getTime());
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);
    var limit = 366 * 24 * 60 * 2;
    for (var i = 0; i < limit; i += 1) {
        if (cronMatches(parsed, cursor))
            return cursor;
        cursor.setMinutes(cursor.getMinutes() + 1);
    }
    return null;
}
exports.nextCronRun = nextCronRun;
/** Validates an expression, returning the error message or null when valid. */
function validateCron(input) {
    var _a;
    try {
        parseCron(input);
        return null;
    }
    catch (error) {
        return String((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error);
    }
}
exports.validateCron = validateCron;
