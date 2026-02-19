export const WindowState = {
  Normal: 'NORMAL',
  Minimized: 'MINIMIZED',
  Maximized: 'MAXIMIZED',
  Fullscreen: 'FULLSCREEN',
} as const;

export type WindowState = (typeof WindowState)[keyof typeof WindowState];

type OperationType = 'MINIMIZE' | 'MAXIMIZE' | 'RESTORE' | 'FULLSCREEN' | 'MOVE' | 'RESIZABLE';

export class AWCController {
  public onMinimize: (() => void) | null = null;
  public onMaximize: (() => void) | null = null;
  public onRestore: (() => void) | null = null;
  public onFullscreen: (() => void) | null = null;
  public onMove: (() => void) | null = null;
  public onResizableChange: ((resizable: boolean) => void) | null = null;

  public onExternalMinimize: (() => void) | null = null;
  public onExternalMaximize: (() => void) | null = null;
  public onExternalRestore: (() => void) | null = null;
  public onExternalFullscreen: (() => void) | null = null;
  public onExternalMove: (() => void) | null = null;
  public onExternalResizableChange: ((resizable: boolean) => void) | null = null;

  private lastEventPromise: Promise<void> = Promise.resolve();
  private currentWindowState: WindowState;
  private currentResizableState: boolean;
  private pendingOperation: OperationType | null = null;
  private pendingOpTimeout: number | null = null;
  private moveHandler = () => this.windowMoved();
  private mediaQueryCleanups: (() => void)[] = [];

  public constructor() {
    this.currentWindowState = this.getCurrentWindowState();
    this.currentResizableState = this.getCurrentResizableState();
    this.registerDisplayStateHandler();
  }

  public dispose() {
    window.removeEventListener('move', this.moveHandler);
    this.mediaQueryCleanups.forEach(cleanup => cleanup());
  }

  public minimize(): Promise<void> {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MINIMIZE');
      await (window as any).minimize();
    });
  }

  public maximize(): Promise<void> {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MAXIMIZE');
      await (window as any).maximize();
    });
  }

  public restore(): Promise<void> {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('RESTORE');
      await (window as any).restore();
    });
  }

  public fullscreen(element: Element): Promise<void> {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('FULLSCREEN');
      await element.requestFullscreen();
    });
  }

  public moveTo(x: number, y: number): Promise<void> {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MOVE');
      window.moveTo(x, y); 
    });
  }

  public moveBy(deltaX: number, deltaY: number): Promise<void> {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MOVE');
      window.moveBy(deltaX, deltaY);
    });
  }

  public setResizable(canResize: boolean): Promise<void> {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('RESIZABLE');
      await (window as any).setResizable(canResize);
    });
  }

  private isProgrammatic (expected: OperationType) {
    if (this.pendingOperation === expected) {
      this.pendingOperation = null;
      if (this.pendingOpTimeout) clearTimeout(this.pendingOpTimeout);
      return true;
    }
    return false;
  };

  private windowStateChanged(oldState: WindowState, newState: WindowState) {
    if (oldState === newState)
      return;

    switch (newState) {
      case WindowState.Normal: {
        this.onRestore?.();
        if (!this.isProgrammatic('RESTORE')) {
          this.onExternalRestore?.();
        }
        break;
      }
      case WindowState.Fullscreen: {
        this.onFullscreen?.();
        if (!this.isProgrammatic('FULLSCREEN')) {
          this.onExternalFullscreen?.();
        }
        break;
      }
      case WindowState.Minimized: {
        this.onMinimize?.();
        if (!this.isProgrammatic('MINIMIZE')) {
          this.onExternalMinimize?.();
        }
        break;
      }
      case WindowState.Maximized: {
        if (oldState === WindowState.Minimized || oldState === WindowState.Fullscreen) {
          this.onRestore?.();
          if (!this.isProgrammatic('RESTORE')) {
            this.onExternalRestore?.();
          }
        } else {
          this.onMaximize?.();
          if (!this.isProgrammatic('MAXIMIZE')) {
            this.onExternalMaximize?.();
          }
        }
        break;
      }
    }
  }

  private windowMoved() {
    this.onMove?.();

    if (!this.isProgrammatic('MOVE')) {
      this.onExternalMove?.();
    }
  }

  private resizableChanged(resizable: boolean) {
    if (this.currentResizableState == resizable) {
      return;
    }

    this.onResizableChange?.(resizable);

    if (!this.isProgrammatic('RESIZABLE')) {
      this.onExternalResizableChange?.(resizable);
    }
    this.currentResizableState = resizable;
  }

  private scheduleNextOperation(operation: () => Promise<void>) : Promise<void> {
    const previousTask = this.lastEventPromise.catch(() => { });
    const currentTaskPromise = previousTask.then(() => operation());
    this.lastEventPromise = currentTaskPromise;
    return currentTaskPromise;
  }

  private getCurrentWindowState() : WindowState {
    if (window.matchMedia('(display-state: normal)').matches) {
      return WindowState.Normal;
    } else if (window.matchMedia('(display-state: minimized)').matches) {
      return WindowState.Minimized;
    } else if (window.matchMedia('(display-state: maximized)').matches) {
      return WindowState.Maximized;
    } else if (window.matchMedia('(display-state: fullscreen)').matches) {
      return WindowState.Fullscreen;
    }
    throw new Error("Error figuring out the current window state");
  }

  private getCurrentResizableState() : boolean {
    if (window.matchMedia('(resizable: true)').matches) {
      return true;
    } else if (window.matchMedia('(resizable: false)').matches) {
      return false;
    }
    throw new Error("Error figuring out the resizable state");
  }

  private registerDisplayStateHandler() {
    const bindState = (mediaQuery: string, state: WindowState) => {
      const mq = window.matchMedia(mediaQuery);
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          this.windowStateChanged(this.currentWindowState, state);
          this.currentWindowState = state;
        }
      };

      mq.addEventListener('change', listener);
      this.mediaQueryCleanups.push(() => mq.removeEventListener('change', listener));
    };

    bindState('(display-state: normal)', WindowState.Normal);
    bindState('(display-state: minimized)', WindowState.Minimized);
    bindState('(display-state: maximized)', WindowState.Maximized);
    bindState('(display-state: fullscreen)', WindowState.Fullscreen);

    const bindResizable = (mediaQuery: string, val: boolean) => {
        const mq = window.matchMedia(mediaQuery);
        const listener = (e: MediaQueryListEvent) => {
            if (e.matches) this.resizableChanged(val);
        };
        mq.addEventListener('change', listener);
        this.mediaQueryCleanups.push(() => mq.removeEventListener('change', listener));
    };

    bindResizable('(resizable: true)', true);
    bindResizable('(resizable: false)', false);

    window.addEventListener('move', this.moveHandler);
  }

  private setPendingOp(op: OperationType) {
    this.pendingOperation = op;
    
    if (this.pendingOpTimeout) clearTimeout(this.pendingOpTimeout);

    this.pendingOpTimeout = window.setTimeout(() => {
      this.pendingOperation = null;
      this.pendingOpTimeout = null;
    }, 5000);
  }
}
