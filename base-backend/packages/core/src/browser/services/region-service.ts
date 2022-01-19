import { injectable } from 'inversify';
import { RegionsServiceClient } from '../../common/services/regions';
import { Emitter, Event } from '../../common';

@injectable()
export class RegionsClient implements RegionsServiceClient {
    private regionEmitter: Emitter<void> = new Emitter<void>();
    onRegionChange: Event<void> = this.regionEmitter.event;
    async regionsChanged(): Promise<void> {
        this.regionEmitter.fire();
    }
}
