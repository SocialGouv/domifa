import { Connection } from 'mongoose';
import { StructureSchema } from '../structures/structure.schema';
import { UserSchema } from './user.schema';

export const UsersProviders = [
  {
    inject: ['DATABASE_CONNECTION'],
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) => connection.model('User', UserSchema),
  }
];
