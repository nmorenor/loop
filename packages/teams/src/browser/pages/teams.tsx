import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, Route, Switch } from 'react-router-dom';

import TeamsIndexPage from './index';
import ShowTeamsPage from './show';

import { TeamsApplicationState } from '../../common/store/types';

// Separate state props + dispatch props to their own interfaces.
interface PropsFromState {
  loading: boolean
  errors?: string
}

// Combine both state + dispatch props - as well as any props we want to pass - in a union type.
type AllProps = PropsFromState & RouteComponentProps;

const TeamsPage: React.FC<AllProps> = ({ match }) =>
  (
    <Switch>
      <Route exact path={`${match.path}/`} component={TeamsIndexPage} />
      <Route path={`${match.path}/:id`} component={ShowTeamsPage} />
    </Switch>
  );

// It's usually good practice to only include one context at a time in a connected component.
// Although if necessary, you can always include multiple contexts. Just make sure to
// separate them from each other to prevent prop conflicts.
const mapStateToProps = ({ teams }: TeamsApplicationState) => ({
  loading: teams.loading,
  errors: teams.errors
});

// Now let's connect our component!
// With redux v4's improved typings, we can finally omit generics here.
export default connect(mapStateToProps)(TeamsPage);
