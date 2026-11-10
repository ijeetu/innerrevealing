import { NextResponse } from 'next/server';
import { ApiError } from './errors';

export function success(data: unknown, message = 'Data fetched successfully.', status = 200): NextResponse {
  return NextResponse.json({ error: false, message, data, code: status }, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export function failure(error: unknown): NextResponse {
  if (error instanceof ApiError) return NextResponse.json({ error: true, message: error.message, data: null, code: error.status }, { status: error.status, headers: { 'Cache-Control': 'no-store' } });
  console.error('Local LMS API request failed:', error instanceof Error ? error.name : 'UnknownError');
  return NextResponse.json({ error: true, message: 'The service is temporarily unavailable. Please try again later.', data: null, code: 503 }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
