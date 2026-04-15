import type {AxiosRequestConfig} from 'axios';
import {axiosClient} from './axiosClient';

export type ApiResult<T> =
  | {ok: true; data: T}
  | {ok: false; errorMessage: string; status?: number};

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as {message?: unknown}).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return 'Request failed';
}

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResult<T>> {
  try {
    const res = await axiosClient.request<T>(config);
    return {ok: true, data: res.data};
  } catch (err: unknown) {
    const anyErr = err as {response?: {status?: number; data?: unknown}};
    const status = anyErr.response?.status;
    const maybeMsg =
      typeof anyErr.response?.data === 'object' &&
      anyErr.response?.data &&
      'message' in (anyErr.response.data as Record<string, unknown>)
        ? (anyErr.response.data as Record<string, unknown>).message
        : undefined;

    const errorMessage =
      typeof maybeMsg === 'string' && maybeMsg.trim()
        ? maybeMsg
        : getErrorMessage(err);

    return {ok: false, errorMessage, status};
  }
}
