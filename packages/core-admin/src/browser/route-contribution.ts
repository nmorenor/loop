import { injectable } from 'inversify';
import { RouteContribution, RoutesApplicationContribution } from '@loop/core/lib/common/routes/routes';
import IndexPage from './pages/index';

@injectable()
export class HomePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/',
            component: IndexPage,
            name: 'Home',
            mainMenu: false,
            exact: false
        };
    }
}
