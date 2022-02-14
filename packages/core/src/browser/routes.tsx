import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Global } from '@emotion/core';

import Root from './components/layout/Root';
import Header from './components/layout/Header';
import normalize from './styles/normalize';
import globals from './styles/globals';
import { RoutesProvider } from '../common/routes/routes';
import { IServiceProvider } from '../common/services/service-provider';

// If your app is big + you have routes with a lot of components, you should consider
// code-splitting your routes! If you bundle stuff up with Webpack, I recommend `react-loadable`.
//
// $ yarn add react-loadable
// $ yarn add --dev @types/react-loadable
//
// The given `pages/` directory provides an example of a directory structure that's easily
// code-splittable.

export interface RoutesProps {
  routeProvider: RoutesProvider;
  serviceProvider: IServiceProvider;
}

const Routes: React.FC<RoutesProps> = ({ routeProvider, serviceProvider }) => (
  <Root className='rootApp'>
    <Global styles={normalize} />
    <Global styles={globals} />
    <Header title='Loop Example' routesProvider={routeProvider} />
    <Switch>
      { routeProvider.getRoutes().map((next, index) => {
        if (next.exact) {
          return <Route key={'main-route-' + index} exact path={next.path}
            render={props => <next.component {...props} serviceProvider={serviceProvider}></next.component>}/>;
        } else {
          return <Route key={'main-route-' + index} path={next.path}
            render={props => <next.component {...props} serviceProvider={serviceProvider}></next.component>}/>;
        }
      })}
      <Route component={() => <div>Not Found</div>} />
    </Switch>
  </Root>
);

export default Routes;
