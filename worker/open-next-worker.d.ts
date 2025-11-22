declare module "../.open-next/worker.js" {
    const worker: {
        fetch: (request: Request, env: CloudflareEnv, ctx: ExecutionContext) => Promise<Response>;
        scheduled?: (event: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext) => Promise<unknown> | unknown;
    };
    export default worker;
}
