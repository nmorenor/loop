import { DisposableCollection } from '../common';
import * as React from 'react';
import { createBrowserHistory } from 'history';
import ReactDOM = require('react-dom');
import Main from './start';
import 'typeface-ibm-plex-sans';
import configureStore from './store/configureStore';
import { RoutesProvider } from '../common/routes/routes';
import { IServiceProvider } from '../common/services/service-provider';

export const renderStart = (
        target: HTMLElement, routeProvider: RoutesProvider,
        serviceProvider: IServiceProvider,
        disposables: DisposableCollection
    ) => {
        // We use hash history because this example is going to be hosted statically.
        // Normally you would use browser history.
        const history = createBrowserHistory();

        const initialState = window['INITIAL_REDUX_STATE'] ? window['INITIAL_REDUX_STATE'] : {} as any;
        const store = configureStore(history, serviceProvider, initialState);

        ReactDOM.render(<Main store={store} history={history} routeProvider={routeProvider} serviceProvider={serviceProvider}/>, target);
};
