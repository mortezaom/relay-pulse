export type SuccessResponse = {
	ok: true;
	data: Record<string, any>;
};

export type ErrorResponse = {
	ok: false;
	message: string;
};

export type RestResponse = SuccessResponse | ErrorResponse;
