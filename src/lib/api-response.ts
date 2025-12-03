import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function createdResponse<T>(data: T) {
  return successResponse(data, 201);
}

export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401);
}

export function notFoundResponse() {
  return errorResponse('Not found', 404);
}

export function validationErrorResponse(error: string) {
  return errorResponse(error, 422);
}
