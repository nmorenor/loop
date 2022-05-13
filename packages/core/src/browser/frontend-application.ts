import { inject, injectable, interfaces, named } from 'inversify';
import { ContributionProvider, DisposableCollection, MaybePromise } from '../common';
import { RoutesProvider } from '../common/routes/routes';
import { IServiceProvider } from '../common/services/service-provider';
import { FrontEndServiceProvider } from './frontend-service-provider';
import { renderStart } from './main';
import { WebSocketConnectionProvider } from './messaging';
import { FrontEndRoutesProvider } from './routes-provider';

/**
 * Clients can implement to get a callback for contributing widgets to a shell on start.
 */
export const FrontendApplicationContribution = Symbol('FrontendApplicationContribution');
export interface FrontendApplicationContribution {

    /**
     * Called on application startup before configure is called.
     */
    initialize?(): void;

    /**
     * Called before commands, key bindings and menus are initialized.
     * Should return a promise if it runs asynchronously.
     */
    configure?(app: FrontendApplication): MaybePromise<void>;

    /**
     * Called when the application is started. The application shell is not attached yet when this method runs.
     * Should return a promise if it runs asynchronously.
     */
    onStart?(app: FrontendApplication): MaybePromise<void>;

    /**
     * Called on `beforeunload` event, right before the window closes.
     * Return `true` in order to prevent exit.
     * Note: No async code allowed, this function has to run on one tick.
     */
    onWillStop?(app: FrontendApplication): boolean | void;

    /**
     * Called when an application is stopped or unloaded.
     *
     * Note that this is implemented using `window.beforeunload` which doesn't allow any asynchronous code anymore.
     * I.e. this is the last tick.
     */
    onStop?(app: FrontendApplication): void;

    /**
     * Called after the application shell has been attached in case there is no previous workbench layout state.
     * Should return a promise if it runs asynchronously.
     */
    initializeLayout?(app: FrontendApplication): MaybePromise<void>;

    /**
     * An event is emitted when a layout is initialized, but before the shell is attached.
     */
    onDidInitializeLayout?(app: FrontendApplication): MaybePromise<void>;
}

/**
 * Default frontend contribution that can be extended by clients if they do not want to implement any of the
 * methods from the interface but still want to contribute to the frontend application.
 */
@injectable()
export abstract class DefaultFrontendApplicationContribution implements FrontendApplicationContribution {

    initialize(): void {
        // NOOP
    }

}

@injectable()
export class FrontendApplication {
    public container: interfaces.Container;
    private disposables: DisposableCollection = new DisposableCollection();

    constructor(
        @inject(ContributionProvider) @named(FrontendApplicationContribution)
        protected readonly contributions: ContributionProvider<FrontendApplicationContribution>,
        @inject(WebSocketConnectionProvider) protected connectionProvider: WebSocketConnectionProvider,
        @inject(FrontEndRoutesProvider) protected readonly routesProvider: RoutesProvider,
        @inject(FrontEndServiceProvider) protected readonly serviceProvider: IServiceProvider
    ) {

    }
    public async start(): Promise<void> {
        await this.startContributions();

        const body = await this.getHost();
        const ctEntry = (document.getElementById('loop') !== undefined && document.getElementById('loop') !== null)
            ? document.getElementById('loop')! : document.createElement('div');
        ctEntry.setAttribute('id', 'loop');
        body.appendChild(ctEntry);

        renderStart(ctEntry, this.routesProvider, this.serviceProvider, this.disposables);
    }

    private getHost(): Promise<HTMLElement> {
        if (document.body) {
            return Promise.resolve(document.body);
        }
        return new Promise<HTMLElement>(resolve =>
            window.addEventListener('load', () => resolve(document.body), { once: true })
        );
    }

    /**
     * Initialize and start the frontend application contributions.
     */
     protected async startContributions(): Promise<void> {
        for (const contribution of this.contributions.getContributions()) {
            if (contribution.initialize) {
                try {
                    contribution.initialize();
                } catch (error) {
                    console.error('Could not initialize contribution', error);
                }
            }
        }

        for (const contribution of this.contributions.getContributions()) {
            if (contribution.configure) {
                try {
                    await contribution.configure(this);
                } catch (error) {
                    console.error('Could not configure contribution', error);
                }
            }
        }

        for (const contribution of this.contributions.getContributions()) {
            if (contribution.onStart) {
                try {
                    await contribution.onStart(this);
                } catch (error) {
                    console.error('Could not start contribution', error);
                }
            }
        }
    }

    /**
     * Stop the frontend application contributions. This is called when the window is unloaded.
     */
    protected stopContributions(): void {
        console.info('>>> Stopping frontend contributions...');
        for (const contribution of this.contributions.getContributions()) {
            if (contribution.onStop) {
                try {
                    contribution.onStop(this);
                } catch (error) {
                    console.error('Could not stop contribution', error);
                }
            }
        }
        console.info('<<< All frontend contributions have been stopped.');
    }
}
