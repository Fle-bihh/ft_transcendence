import "reflect-metadata";
import { DataSource } from 'typeorm';
export declare class AppModule {
    private dataSource;
    constructor(dataSource: DataSource);
}
