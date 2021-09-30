import { LoopContainer, ApplicationConfigProvider } from '@loop/core/lib';
import { injectable, interfaces, inject, LazyServiceIdentifer } from 'inversify';
import { Sequelize } from 'sequelize';
import { LoopSequelize, ModelServiceContribution } from '../data-models-manager';
import { Region, SubRegion } from '../model/region-model';

/**
 * Monitor Hosts Health
 */
@injectable()
export class GeoIpService implements ModelServiceContribution {
    private interval: NodeJS.Timeout | undefined;
    constructor(
        @inject(new LazyServiceIdentifer(() => LoopContainer)) private container: interfaces.Container,
        @inject(new LazyServiceIdentifer(() => LoopSequelize)) protected sequelize: Sequelize,
        @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider
    ) {
        // such empty
    }
    public async start(): Promise<void> {
        if (!this.appConfig || !this.appConfig.config) {
            return Promise.resolve();
        }
        // TODO: read maxmind geoip database with reader
    }
    public stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        this.container.unbind(LoopSequelize);
    }
    public getRegionFor(address: string): Region | undefined {
        // TODO:
        return undefined;
    }
    public getSubRegionFor(address: string): SubRegion | undefined {
        // TODO:
        return undefined;
    }
}
