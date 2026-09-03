export interface ElectronAPI {
  getSystemInfo: () => Promise<{
    platform: string;
    arch: string;
    cpus: number;
    totalMemory: number;
    freeMemory: number;
    hostname: string;
    username: string;
  }>;
  getAppVersion: () => Promise<string>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  platform: string;
  onUpdateAvailable: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
