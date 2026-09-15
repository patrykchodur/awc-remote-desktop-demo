export declare const WindowState: {
  readonly Normal: "NORMAL";
  readonly Minimized: "MINIMIZED";
  readonly Maximized: "MAXIMIZED";
  readonly Fullscreen: "FULLSCREEN";
};

export type WindowState = (typeof WindowState)[keyof typeof WindowState];

export declare class AWCController {
  onMinimize: (() => void) | null;
  onMaximize: (() => void) | null;
  onRestore: (() => void) | null;
  onFullscreen: (() => void) | null;
  onMove: (() => void) | null;
  onMoveStarted: (() => void) | null;
  onMoveEnded: (() => void) | null;
  onResizableChange: ((resizable: boolean) => void) | null;

  onExternalMinimize: (() => void) | null;
  onExternalMaximize: (() => void) | null;
  onExternalRestore: (() => void) | null;
  onExternalFullscreen: (() => void) | null;
  onExternalMove: (() => void) | null;
  onExternalMoveStarted: (() => void) | null;
  onExternalMoveEnded: (() => void) | null;
  onExternalResizableChange: ((resizable: boolean) => void) | null;

  private lastEventPromise;
  private currentWindowState;
  private currentResizableState;
  private pendingOperation;
  private pendingOpTimeout;
  private mediaQueryCleanups;
  private continuePollingWindowPosition;
  private lastX;
  private lastY;
  private duringMove;
  private animationId;
  private requestAnimationCallback;
  private isCurrentMoveProgrammatic;

  constructor();

  dispose(): void;

  minimize(): Promise<void>;
  maximize(): Promise<void>;
  restore(): Promise<void>;
  fullscreen(element: Element): Promise<void>;
  moveTo(x: number, y: number): Promise<void>;
  moveBy(deltaX: number, deltaY: number): Promise<void>;
  setResizable(canResize: boolean): Promise<void>;

  private isProgrammatic;
  private windowStateChanged;
  private windowMoved;
  private windowMoveStarted;
  private windowMoveEnded;
  private resizableChanged;
  private scheduleNextOperation;
  private getCurrentWindowState;
  private getCurrentResizableState;
  private registerDisplayStateHandler;
  private startMovePolling;
  private stopMovePolling;
  private pollWindowPosition;
  private setPendingOp;
}
