import { ContainerModule } from 'inversify';
import { HeroesPageContribution } from '@loop/core/lib/browser/pages/heroes/contribution';
import { ReducerApplicationContribution, SagasApplicationContribution } from '@loop/core/lib/common/services/store-contributor';
import { RoutesApplicationContribution } from '@loop/core/lib/common/routes/routes';
import { HeroesReducerContribution, HeroesSagasApplicationContribution } from '../common/store/store-contribution';

export default new ContainerModule(bind => {

    bind(HeroesPageContribution).toSelf();
    bind(RoutesApplicationContribution).toService(HeroesPageContribution);

    bind(HeroesReducerContribution).toSelf();
    bind(ReducerApplicationContribution).toService(HeroesReducerContribution);

    bind(HeroesSagasApplicationContribution).toSelf();
    bind(SagasApplicationContribution).toService(HeroesSagasApplicationContribution);
});
