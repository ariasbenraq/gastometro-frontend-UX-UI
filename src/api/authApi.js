import { post } from './httpClient';

export const signIn = (payload) => post('/auth/signin', payload);

export const signUp = (payload) => post('/auth/signup', payload);

export const requestPasswordReset = (payload) =>
  post('/auth/password-reset/request', payload);

export const verifyPasswordReset = (payload) =>
  post('/auth/password-reset/verify', payload);

export const confirmPasswordReset = (payload) =>
  post('/auth/password-reset/confirm', payload);
