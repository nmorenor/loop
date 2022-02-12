import { combineReducers, Reducer } from 'redux';
import { all, fork, ForkEffect } from 'redux-saga/effects';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';

import { layoutReducer, LayoutState } from './layout';

import { AppState, ReducerApplicationContribution, SagasApplicationContribution } from '../../common/services/store-contributor';
import { IServiceProvider } from '../../common/services/service-provider';

// The top-level state object
export interface ApplicationState extends AppState {
  layout: LayoutState;
  router: RouterState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property
// using the reducer with the matching name. It's important that the names match exactly, and that
// the reducer acts on the corresponding ApplicationState property type.
export const createRootReducer = (history: History, serviceProvider: IServiceProvider) => {
  let target = {
    layout: layoutReducer,
    router: connectRouter(history)
  };
  if (serviceProvider) {
    const contribs = serviceProvider.getContributions<ReducerApplicationContribution>(ReducerApplicationContribution);
    if (contribs && contribs.length) {
      for (const nextContrib of contribs) {
        if (!nextContrib) {
          continue;
        }
        const reducerEntry = nextContrib.getReducer();
        const nextReducer: Record<string, Reducer<any>> = {};
        nextReducer[reducerEntry.name] = reducerEntry.reducer;
        target = Object.assign({}, target, nextReducer);
      }
    }
  }
  const result = combineReducers(target);
  return result;
};

// Here we use `redux-saga` to trigger actions asynchronously. `redux-saga` uses something called a
// "generator function", which you can read about here:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
export function* rootSaga(serviceProvider: IServiceProvider) {
  const contribs = serviceProvider.getContributions<SagasApplicationContribution>(SagasApplicationContribution);
  const effects: Array<ForkEffect<void>> = [];
  if (contribs && contribs.length) {
    for (const nextContrib of contribs) {
      if (!nextContrib) {
        continue;
      }
      effects.push(fork(nextContrib.getSaga()));
    }
  }
  yield all(effects);
}
