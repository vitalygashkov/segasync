declare class Progress {
  constructor(params: ProgressParams);

  setSize(size: number): void;
  setPrefix(prefix?: string): void;
  increase(value?: number): void;
  update(progress: number): void;
  stop(): void;
}

interface ProgressParams {
  size: number;
  label: string;
  prefix: string;
}

export { Progress, ProgressParams };
