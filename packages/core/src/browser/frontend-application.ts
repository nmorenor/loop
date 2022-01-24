import { inject, injectable, interfaces } from 'inversify';
import { DisposableCollection } from '../common';
import { regionsPath, RegionsService } from '../common/services/regions';
import { renderStart } from './components/main';
import { WebSocketConnectionProvider } from './messaging';
import { RegionsClient } from './services/region-service';

@injectable()
export class FrontendApplication {
    public container: interfaces.Container;
    private disposables: DisposableCollection = new DisposableCollection();

    constructor(@inject(WebSocketConnectionProvider) protected connectionProvider: WebSocketConnectionProvider,
        @inject(RegionsClient) protected regionsClient: RegionsClient
    ) {

    }
    public async start(): Promise<void> {
        const greetingsService = this.connectionProvider.createProxy<RegionsService>(regionsPath, this.regionsClient);

        const body = await this.getHost();
        const ctEntry = document.createElement('div');
        ctEntry.setAttribute('id', 'loop');
        ctEntry.classList.add('loop-out-box');
        body.appendChild(ctEntry);

        renderStart(ctEntry, 'Loop Backend', 'Welcome to Loop Backend', greetingsService, this.regionsClient, this.disposables);
    }

    private getHost(): Promise<HTMLElement> {
        if (document.body) {
            return Promise.resolve(document.body);
        }
        return new Promise<HTMLElement>(resolve =>
            window.addEventListener('load', () => resolve(document.body), { once: true })
        );
    }
}
