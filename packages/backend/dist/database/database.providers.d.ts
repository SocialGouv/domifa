/// <reference types="mongoose-sequence" />
import * as mongoose from 'mongoose';
export declare const databaseProviders: {
    provide: string;
    useFactory: () => Promise<typeof mongoose>;
}[];
