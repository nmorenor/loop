import { ContainerModule } from 'inversify';
import { RoutesApplicationContribution } from '@loop/core/lib/common/routes/routes';
import { HomePageContribution } from './route-contribution';

export default new ContainerModule(bind => {

    bind(HomePageContribution).toSelf();
    bind(RoutesApplicationContribution).toService(HomePageContribution);
});
