import { ContainerModule } from 'inversify';
import { RoutesApplicationContribution } from '@loop/core/lib/common/routes/routes';
import { ReducerApplicationContribution, SagasApplicationContribution } from '@loop/core/lib/common/services/store-contributor';
import { TeamsPageContribution } from './pages/contribution';
import { TeamsReducerContribution, TeamsSagasApplicationContribution } from '../common/store/store-contribution';

export default new ContainerModule(bind => {

    bind(TeamsPageContribution).toSelf();
    bind(RoutesApplicationContribution).toService(TeamsPageContribution);

    bind(TeamsReducerContribution).toSelf();
    bind(ReducerApplicationContribution).toService(TeamsReducerContribution);

    bind(TeamsSagasApplicationContribution).toSelf();
    bind(SagasApplicationContribution).toService(TeamsSagasApplicationContribution);
});
