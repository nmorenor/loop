import { injectable } from 'inversify';
import { AllEffect, ForkEffect } from 'redux-saga/effects';
import { ReducerApplicationContribution, ReducerEntry, SagasApplicationContribution } from '../../../common/services/store-contributor';
import { teamsReducer } from './reducer';
import teamsSaga from './sagas';

@injectable()
export class TeamsReducerContribution implements ReducerApplicationContribution {
    getReducer(): ReducerEntry<any> {
        return {
            name: 'teams',
            reducer: teamsReducer
        };
    }
}

@injectable()
export class TeamsSagasApplicationContribution implements SagasApplicationContribution {
    getSaga(): () => Generator<AllEffect<ForkEffect<void>>, void, any> {
        return teamsSaga;
    }
}
