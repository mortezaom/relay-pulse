const KV_AUTH_KEY = "auth-data";
export const COOKIE_AUTH_KEY = "auth-token";

export type AuthUser = {
	email: string;
	password: string;
};

export const isDashboardInitialized = async (env: CloudflareEnv) => {
	const rKV = env.RELAY_PULSE_KV;
	const userString = await rKV.get(KV_AUTH_KEY);
	return !!userString;
};

export const getAuthUser = async (env: CloudflareEnv) => {
	const rKV = env.RELAY_PULSE_KV;
	const userString = await rKV.get(KV_AUTH_KEY);
	if (!userString) return null;
	return JSON.parse(userString) as AuthUser;
};

export const saveAuthUser = async (
	env: CloudflareEnv,
	userData: AuthUser,
) => {
	const rKV = env.RELAY_PULSE_KV;
	await rKV.put(KV_AUTH_KEY, JSON.stringify(userData));
	return userData;
};
