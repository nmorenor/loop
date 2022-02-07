import { all, AllEffect, call, fork, ForkEffect, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { Team, TeamsActionTypes, TeamSelectedPayload } from './types';
import { fetchError, fetchSuccess, selectTeam, teamSelected } from './actions';
import { callApi, RespError } from '../../utils/api';

const API_ENDPOINT = 'https://api.opendota.com';

function* handleFetch() {
  try {
    // To call async functions, use redux-saga's `call()`.
    const res: Team[] | RespError = yield call(callApi, 'get', API_ENDPOINT, '/teams');

    if ('error' in res) {
      yield put(fetchError(res.error));
    } else {
      yield put(fetchSuccess(res));
    }
  } catch (err) {
    if (err instanceof Error && err.stack) {
      yield put(fetchError(err.stack));
    } else {
      yield put(fetchError('An unknown error occured.'));
    }
  }
}

function* handleSelect(action: ReturnType<typeof selectTeam>) {
  try {
    const detail: TeamSelectedPayload | RespError = yield call(callApi, 'get', API_ENDPOINT, `/teams/${action.payload}`);
    const players: TeamSelectedPayload | RespError = yield call(callApi, 'get', API_ENDPOINT, `/teams/${action.payload}/players`);

    if ('error' in detail || 'error' in players) {
      yield put(fetchError((detail as RespError).error || (players as RespError).error));
    } else {
      yield put(teamSelected(detail));
      yield put(teamSelected(players));
    }
  } catch (err) {
    if (err instanceof Error && err.stack) {
      yield put(fetchError(err.stack));
    } else {
      yield put(fetchError('An unknown error occured.'));
    }
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchFetchRequest() {
  yield takeEvery(TeamsActionTypes.FETCH_REQUEST, handleFetch);
}

function* watchSelectTeam() {
  yield takeLatest(TeamsActionTypes.SELECT_TEAM, handleSelect);
}

// We can also use `fork()` here to split our saga into multiple watchers.
function* heroesSaga(): Generator<AllEffect<ForkEffect<void>>, void, any> {
  yield all([fork(watchFetchRequest), fork(watchSelectTeam)]);
}

export default heroesSaga;
