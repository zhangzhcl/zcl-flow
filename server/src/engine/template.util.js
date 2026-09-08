"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateDeep = exports.interpolate = exports.resolvePath = void 0;
/**
 * Resolve a dotted path (e.g. "input.city" or "nodes.llm_1.text")
 * against the run context.
 */
function resolvePath(path, ctx) {
    var scopes = {
        input: ctx.input,
        nodes: ctx.outputs,
        variables: ctx.variables,
    };
    var segments = path.trim().split('.');
    var current = scopes;
    for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
        var segment = segments_1[_i];
        if (current == null)
            return undefined;
        current = current[segment];
    }
    return current;
}
exports.resolvePath = resolvePath;
/**
 * Interpolate "{{ path }}" template expressions inside a string.
 * If the whole string is a single expression, the raw value is returned
 * (preserving objects/numbers); otherwise values are stringified.
 */
function interpolate(template, ctx) {
    if (typeof template !== 'string')
        return template;
    var single = template.match(/^\s*\{\{([^}]+)\}\}\s*$/);
    if (single) {
        return resolvePath(single[1], ctx);
    }
    return template.replace(/\{\{([^}]+)\}\}/g, function (_, expr) {
        var value = resolvePath(expr, ctx);
        if (value == null)
            return '';
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
    });
}
exports.interpolate = interpolate;
/** Deeply interpolate all string values of an object. */
function interpolateDeep(value, ctx) {
    if (typeof value === 'string') {
        return interpolate(value, ctx);
    }
    if (Array.isArray(value)) {
        return value.map(function (item) { return interpolateDeep(item, ctx); });
    }
    if (value !== null && typeof value === 'object') {
        var result = {};
        for (var _i = 0, _a = Object.entries(value); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            result[key] = interpolateDeep(val, ctx);
        }
        return result;
    }
    return value;
}
exports.interpolateDeep = interpolateDeep;
