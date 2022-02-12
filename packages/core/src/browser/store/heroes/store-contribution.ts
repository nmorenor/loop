import { injectable } from 'inversify';
import { AllEffect, ForkEffect } from 'redux-saga/effects';
import { ReducerApplicationContribution, ReducerEntry, SagasApplicationContribution } from '../../../common/services/store-contributor';
import { heroesReducer } from './reducer';
import heroesSaga from './sagas';

@injectable()
export class HeroesReducerContribution implements ReducerApplicationContribution {
    getReducer(): ReducerEntry<any> {
        return {
            name: 'heroes',
            reducer: heroesReducer
        };
    }
}

@injectable()
export class HeroesSagasApplicationContribution implements SagasApplicationContribution {
    getSaga(): () => Generator<AllEffect<ForkEffect<void>>, void, any> {
        return heroesSaga;
    }
}
