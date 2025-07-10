import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type NextRequest, NextResponse } from "next/server";
import { COOKIE_AUTH_KEY, getAuthUser } from "./data/user-storage";
import { verifyJWTToken } from "./lib/encryption";

export const config = {
	matcher: ["/auth/:path*", "/api/:function*", "/dashboard/:function*"],
};

const authMiddleware = async (req: NextRequest) => {
	const verifiedCookie = await verifyJWTToken(
		req.cookies.get(COOKIE_AUTH_KEY)?.value ?? null,
	);
	if (!verifiedCookie) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const user = await getAuthUser(getCloudflareContext().env);

	if (verifiedCookie.email !== user?.email) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const requestHeaders = new Headers(req.headers);
	requestHeaders.set("x-user-email", verifiedCookie.email);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
};

const authPathMiddleware = async (req: NextRequest) => {
	const myKv = getCloudflareContext().env.RELAY_PULSE_KV;

	const authPath = (await myKv.get("auth-path")) ?? "login";

	if (req.nextUrl.pathname === `/auth/${authPath}`) {
		const isLoggedIn = !!req.cookies.get(COOKIE_AUTH_KEY)?.value;
		if (isLoggedIn) {
			return NextResponse.redirect(new URL("/dashboard", req.url));
		} else {
			return NextResponse.next();
		}
	} else {
		return NextResponse.redirect(new URL("/", req.url));
	}
};

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/auth")) {
		return authPathMiddleware(req);
	}

	if (
		pathname.startsWith("/dashboard") ||
		(pathname.startsWith("/api") &&
			!pathname.startsWith("/api/setup") &&
			!pathname.startsWith("/api/login"))
	) {
		return authMiddleware(req);
	}

	return NextResponse.next();
}
