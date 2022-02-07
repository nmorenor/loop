import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Global } from '@emotion/core';

import Root from './components/layout/Root';
import Header from './components/layout/Header';
import IndexPage from './pages/index';
import TeamsPage from './pages/teams';
import normalize from './styles/normalize';
import globals from './styles/globals';
import { RoutesProvider } from '../common/routes/routes';

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
}

const Routes: React.FC<RoutesProps> = ({ routeProvider }) => (
  <Root className='rootApp'>
    <Global styles={normalize} />
    <Global styles={globals} />
    <Header title='Example App' />
    <Switch>
      <Route exact path='/' component={IndexPage} />
      { routeProvider.getRoutes().map((next, index) => <Route key={'main-route-' + index} path={next.path} component={next.component} />) }
      {/* <Route path='/heroes' component={HeroesPage} /> */}
      <Route path='/teams' component={TeamsPage} />
      <Route component={() => <div>Not Found</div>} />
    </Switch>
  </Root>
);

export default Routes;
