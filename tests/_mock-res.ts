export interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockResponse;
  json: (data: unknown) => MockResponse;
  setHeader: (key: string, value: string) => MockResponse;
}

export function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 0,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
  };
  return res;
}

export function createMockRequest(opts: {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
} = {}): any {
  return {
    method: opts.method ?? 'POST',
    headers: opts.headers ?? {},
    body: opts.body,
    socket: { remoteAddress: '127.0.0.1' },
  };
}
