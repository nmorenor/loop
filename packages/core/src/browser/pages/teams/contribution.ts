import { injectable } from 'inversify';
import { RouteContribution, RoutesApplicationContribution } from '../../../common/routes/routes';
import TeamsIndexPage from './index';

@injectable()
export class TeamsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/teams',
            component: TeamsIndexPage,
            name: 'Heroes',
            mainMenu: true
        };
    }
}
