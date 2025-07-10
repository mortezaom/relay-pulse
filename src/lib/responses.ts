import { NextResponse } from "next/server";

export const successResponse = (data: object, code: number = 200) => {
	return NextResponse.json({ ok: true, data }, { status: code });
};

export const errorResponse = (message: string, code: number) => {
	return NextResponse.json({ ok: false, message }, { status: code });
};
