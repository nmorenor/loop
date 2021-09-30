import { injectable, interfaces } from 'inversify';
import { renderStart } from './components/main';

@injectable()
export class FrontendApplication {
    public container: interfaces.Container;

    public async start(): Promise<void> {
        const body = await this.getHost();
        const ctEntry = document.createElement('div');
        ctEntry.setAttribute('id', 'codetogether');
        ctEntry.classList.add('loop-out-box');
        body.appendChild(ctEntry);

        renderStart(ctEntry, 'Loop Backend', 'Welcome to Loop Backend');
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
