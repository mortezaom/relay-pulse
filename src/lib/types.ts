export type SuccessResponse = {
  ok: true;
  data: Record<string, unknown>;
};

export type ErrorResponse = {
  ok: false;
  message: string;
};

export type RestResponse = SuccessResponse | ErrorResponse;
