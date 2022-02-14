import { ConnectedComponent } from 'react-redux';
import { RouteComponentProps } from 'react-router';

export const RoutesApplicationContribution = Symbol('RoutesApplicationContribution');
export interface RouteContribution {
    path: string;
    component: ConnectedComponent<any, any> | React.ComponentType<any>;
    name: string;
    mainMenu: boolean;
    exact: boolean;
}
export interface RoutesApplicationContribution {
    getRoute(): RouteContribution;
}

export interface RoutesProvider {
    getRoutes(): RouteContribution[];
}
