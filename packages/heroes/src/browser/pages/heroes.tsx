import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, Route, Switch } from 'react-router-dom';

import HeroesIndexPage from './index';
import ShowHeroesPage from './show';

import { Hero, HeroesApplicationState } from '../../common/store/types';

// Separate state props + dispatch props to their own interfaces.
interface PropsFromState {
  loading: boolean
  data: Hero[]
  errors?: string
}

// Combine both state + dispatch props - as well as any props we want to pass - in a union type.
type AllProps = PropsFromState & RouteComponentProps;

const HeroesPage: React.FC<AllProps> = ({ match }) =>
  (
    <Switch>
      <Route exact path={`${match.path}/`} component={HeroesIndexPage} />
      <Route path={`${match.path}/:name`} component={ShowHeroesPage} />
    </Switch>
  );

// It's usually good practice to only include one context at a time in a connected component.
// Although if necessary, you can always include multiple contexts. Just make sure to
// separate them from each other to prevent prop conflicts.
const mapStateToProps = ({ heroes }: HeroesApplicationState) => ({
  loading: heroes.loading,
  errors: heroes.errors,
  data: heroes.data
});

// Now let's connect our component!
// With redux v4's improved typings, we can finally omit generics here.
export default connect(mapStateToProps)(HeroesPage);
