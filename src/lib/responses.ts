import { NextResponse } from "next/server";

export const successResponse = (data: object, code = 200) =>
  NextResponse.json({ ok: true, data }, { status: code });

export const errorResponse = (message: string, code: number) =>
  NextResponse.json({ ok: false, message }, { status: code });
