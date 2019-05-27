import { Connection } from 'mongoose';
import { InteractionSchema } from './interaction.schema';

export const InteractionsProviders = [
  {
    inject: ['DATABASE_CONNECTION'],
    provide: 'INTERACTION_MODEL',
    useFactory: (connection: Connection) => connection.model('Interaction', InteractionSchema),
  },
];
