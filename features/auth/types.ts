export type AuthMode = 'signin' | 'signup' | 'forgot';

type AuthSuccess<T> = {ok: true; data: T};
type AuthFailure = {ok: false; errorMessage: string};

export type AuthResult<T> = AuthSuccess<T> | AuthFailure;
