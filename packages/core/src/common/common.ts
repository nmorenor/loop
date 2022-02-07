export const LoopContainer = Symbol('LoopContainer');
export function notEmpty<T>(value: T | undefined): value is T {
    return value !== undefined;
}
