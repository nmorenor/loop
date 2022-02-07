import { ConnectedComponent } from 'react-redux';

export const RoutesApplicationContribution = Symbol('RoutesApplicationContribution');
export interface RouteContribution {
    path: string;
    component: ConnectedComponent<any, any>;
}
export interface RoutesApplicationContribution {
    getRoute(): RouteContribution;
}

export interface RoutesProvider {
    getRoutes(): RouteContribution[];
}
