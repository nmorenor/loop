import { DisposableCollection } from '../common';
import * as React from 'react';
import { createBrowserHistory } from 'history';
import ReactDOM = require('react-dom');
import { RegionsService } from '../common/services/regions';
import { RegionsClient } from './services/region-service';
import Main from './start';
import 'typeface-ibm-plex-sans';
import configureStore from './store/configureStore';
import { RoutesProvider } from '../common/routes/routes';

export const renderStart = (
        target: HTMLElement, routeProvider: RoutesProvider,
        disposables: DisposableCollection
    ) => {
        // We use hash history because this example is going to be hosted statically.
        // Normally you would use browser history.
        const history = createBrowserHistory();

        const initialState = window['INITIAL_REDUX_STATE'] ? window['INITIAL_REDUX_STATE'] : {} as any;
        const store = configureStore(history, initialState);

        ReactDOM.render(<Main store={store} history={history} routeProvider={routeProvider} />, target);
        // ReactDOM.render(
        //     <Start title={title} message={message} regionsService={regionsService}
        //     regionsServiceClient={regionsServiceClient} disposables={disposables}></Start>,
        //     target
        // );
};
