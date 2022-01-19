import { LoopContainer } from '@loop/core/lib';
import { injectable, interfaces, inject, LazyServiceIdentifer } from 'inversify';
import { Sequelize } from 'sequelize';
import { ModelServiceContribution, LoopSequelize } from '../data-models-manager';
import { Region } from '../model/region-model';

/**
 * Monitor Hosts Health
 */
@injectable()
export class RegionsMonitor implements ModelServiceContribution {
    private interval: NodeJS.Timeout | undefined;
    constructor(
        @inject(new LazyServiceIdentifer(() => LoopContainer)) private container: interfaces.Container,
        @inject(new LazyServiceIdentifer(() => LoopSequelize)) protected sequelize: Sequelize
    ) {
        // such empty
    }
    public async start(): Promise<void> {
        this.interval = setInterval(this.processHosts.bind(this), (1000 * 60 * 3));
        setTimeout(() => this.processHosts(), 1);
    }
    public stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        this.container.unbind(LoopSequelize);
    }
    private async processHosts(): Promise<void> {
        // TODO: search hosts by continent and monitor hosts status via http
        const continents = await Region.findAll();
        continents.forEach((next: Region) => {
            console.log(next.get('name') + ' - ' + next.get('code'));
        });
    }
}
