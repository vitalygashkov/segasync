declare const download: (urls: string[], options: DownloadOptions) => Promise<void>;

interface DownloadOptions {
  filepath?: string;
  headers?: Record<string, string>;
  partSize?: number;
  logger?: Logger;
  logPrefix?: string;
}

interface Logger {
  info: () => void;
  error: () => void;
  debug: () => void;
}

export { download, DownloadOptions, Logger };
