import { get } from './httpClient';

export const fetchUsuarios = () => get('/usuarios');
