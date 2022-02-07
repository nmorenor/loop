import { injectable } from 'inversify';
import { RouteContribution, RoutesApplicationContribution } from '../../../common/routes/routes';
import HeroesPage from './index';

@injectable()
export class HeroesPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/heroes',
            component: HeroesPage
        };
    }
}
