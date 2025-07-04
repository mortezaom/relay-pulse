// src/types/env.ts
import type {
	ExecutionContext,
	IncomingRequestCfProperties,
	KVNamespace,
} from "@cloudflare/workers-types";

export interface CloudflareEnv {
	RELAY_PULSE_KV: KVNamespace;
	// Add other bindings here
}

declare module "vinxi/http" {
	interface H3EventContext {
		cloudflare: {
			env: CloudflareEnv;
			cf: IncomingRequestCfProperties;
			ctx: ExecutionContext;
		};
	}
}
