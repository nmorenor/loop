import { injectable } from 'inversify';
import { RouteContribution, RoutesApplicationContribution } from '@loop/core/lib/common/routes/routes';
import TeamsIndexPage from './index';

@injectable()
export class TeamsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/teams',
            component: TeamsIndexPage,
            name: 'Teams',
            mainMenu: true,
            exact: false
        };
    }
}
