import { AnyAction, Reducer } from 'redux';
import { AllEffect, ForkEffect } from 'redux-saga/effects';
export const ReducerApplicationContribution = Symbol('ReducerApplicationContribution');
export const SagasApplicationContribution = Symbol('SagasApplicationContribution');
export type AppState = Record<string, any>;
export interface ReducerEntry<T extends AppState> {
    reducer: Reducer<T, AnyAction>;
    name: string;
}
export interface ReducerApplicationContribution {
    getReducer(): ReducerEntry<any>;
}

export interface SagasApplicationContribution {
    getSaga(): () => Generator<AllEffect<ForkEffect<void>>, void, any>;
}
