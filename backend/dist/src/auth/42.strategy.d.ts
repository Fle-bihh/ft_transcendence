declare const ApiStrategy_base: new (...args: any[]) => any;
export declare class ApiStrategy extends ApiStrategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<void>;
}
export {};
