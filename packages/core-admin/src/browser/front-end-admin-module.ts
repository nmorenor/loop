import { ContainerModule } from 'inversify';
import { RoutesApplicationContribution } from '@loop/core/lib/common/routes/routes';
import { HomePageContribution } from './route-contribution';
import { RegionsClient } from './services/region-service';

export default new ContainerModule(bind => {

    bind(HomePageContribution).toSelf();
    bind(RoutesApplicationContribution).toService(HomePageContribution);

    bind(RegionsClient).toSelf().inSingletonScope();
});
