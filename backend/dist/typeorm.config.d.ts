declare const config: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities: string[];
    migrations: string[];
    cli: {
        migrationsDir: string;
    };
};
export default config;
