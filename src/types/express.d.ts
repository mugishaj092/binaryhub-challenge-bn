import { User } from './user.types';

declare namespace Express {
    export interface Request {
        user?: User;
    }
}
