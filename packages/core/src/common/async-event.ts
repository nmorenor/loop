import { CancellationToken } from './cancellation';
import { Callback, Emitter, WaitUntilEvent } from './event';

export class AsyncEmitter<T extends WaitUntilEvent> extends Emitter<T> {

    protected deliveryQueue: Promise<void> | undefined;

    /**
     * Fire listeners async one after another.
     */
    fire(event: Omit<T, 'waitUntil'>, token: CancellationToken = CancellationToken.None,
        promiseJoin?: (p: Promise<any>, listener: Function) => Promise<any>): Promise<void> {
        const callbacks = this._callbacks;
        if (!callbacks) {
            return Promise.resolve();
        }
        const listeners = [...callbacks];
        if (this.deliveryQueue) {
            return this.deliveryQueue = this.deliveryQueue.then(() => this.deliver(listeners, event, token, promiseJoin));
        }
        return this.deliveryQueue = this.deliver(listeners, event, token, promiseJoin);
    }

    protected async deliver(listeners: Callback[], event: Omit<T, 'waitUntil'>, token: CancellationToken,
        promiseJoin?: (p: Promise<any>, listener: Function) => Promise<any>): Promise<void> {
        for (const listener of listeners) {
            if (token.isCancellationRequested) {
                return;
            }
            const waitables: Promise<void>[] = [];
            const asyncEvent = Object.assign(event, {
                waitUntil: (thenable: Promise<any>) => {
                    if (Object.isFrozen(waitables)) {
                        throw new Error('waitUntil cannot be called asynchronously.');
                    }
                    if (promiseJoin) {
                        thenable = promiseJoin(thenable, listener);
                    }
                    waitables.push(thenable);
                }
            }) as T;
            try {
                listener(event);
                // Asynchronous calls to `waitUntil` should fail.
                Object.freeze(waitables);
            } catch (e) {
                console.error(e);
            } finally {
                delete (asyncEvent as any)['waitUntil'];
            }
            if (!waitables.length) {
                return;
            }
            try {
                await Promise.all(waitables);
            } catch (e) {
                console.error(e);
            }
        }
    }

}
