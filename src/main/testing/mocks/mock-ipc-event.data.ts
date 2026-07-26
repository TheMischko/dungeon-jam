import WebContents = Electron.WebContents;
import IpcMainEvent = Electron.IpcMainEvent;

/**
 * Create a mock ipcMain event object
 * Useful for simulating IPC events in tests
 *
 * @param options - IpcMainEvent override
 * @returns Mock ipcMain event object
 */
export function mockIpcMainEvent(options?: Partial<IpcMainEvent>): IpcMainEvent {
  return {
    defaultPrevented: false,
    frameId: 0,
    ports: [],
    preventDefault(): void {
      return;
    },
    reply(_: string, __: any): void {
    },
    returnValue: undefined,
    senderFrame: null,
    type: "frame",
    processId: Math.round(Math.random() * 1000),
    sender: {
      on: vi.fn(),
      send: vi.fn(),
    } as unknown as WebContents,
    ...options
  };
}