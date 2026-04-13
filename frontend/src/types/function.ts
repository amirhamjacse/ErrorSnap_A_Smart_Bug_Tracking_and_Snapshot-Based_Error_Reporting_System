export type zeroArgsFunction<T1 = void> = () => T1;

export type setFunction<T1, T2 = void> = (value: T1) => T2;

export type setFunctionAsync<T1, T2 = void> = (value: T1) => Promise<T2>;
