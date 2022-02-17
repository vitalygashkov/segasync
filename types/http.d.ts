interface Response {
  statusCode: number;
  headers: Record<string, string>;
  data: any;
}

declare const httpRequest: (url: string, options?: Record<string, any>) => Promise<Response>;

declare const sleep: (seconds: number) => Promise<void>;

declare const fetch: (url: string, options?: Record<string, any>) => Promise<Response>;

export { Response, httpRequest, sleep, fetch };
