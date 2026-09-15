export const WindowState = {
  Normal: 'NORMAL',
  Minimized: 'MINIMIZED',
  Maximized: 'MAXIMIZED',
  Fullscreen: 'FULLSCREEN',
};

export class AWCController {
  /* State change events - both user-initiated and from the API */
  onMinimize = null;
  onMaximize = null;
  onRestore = null;
  onFullscreen = null;
  // onMove is called on every frame during a window drag.
  onMove = null;
  // onMoveStarted is called when the drag has begun.
  onMoveStarted = null;
  // onMoveEnded is called when the drag has ended.
  onMoveEnded = null;
  onResizableChange = null;

  /* User-initiated (or OS-initiated) state change events */
  onExternalMinimize = null;
  onExternalMaximize = null;
  onExternalRestore = null;
  onExternalFullscreen = null;
  onExternalMove = null;
  onExternalMoveStarted = null;
  onExternalMoveEnded = null;
  onExternalResizableChange = null;

  /* Private variables */
  lastEventPromise = Promise.resolve();
  currentWindowState;
  currentResizableState;
  pendingOperation = null;
  pendingOpTimeout = null;
  mediaQueryCleanups = [];
  /* Detecting window move */
  continuePollingWindowPosition = false;
  lastX = 0;
  lastY = 0;
  duringMove = false;
  animationId = null;
  requestAnimationCallback = () => this.pollWindowPosition();
  isCurrentMoveProgrammatic = false;


  /* Public methods */
  constructor() {
    this.currentWindowState = this.getCurrentWindowState();
    this.currentResizableState = this.getCurrentResizableState();
    this.registerDisplayStateHandler();
  }

  dispose() {
    this.stopMovePolling();
    this.mediaQueryCleanups.forEach(cleanup => cleanup());
  }

  minimize() {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MINIMIZE');
      await window.minimize();
    });
  }

  maximize() {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MAXIMIZE');
      await window.maximize();
    });
  }

  restore() {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('RESTORE');
      await window.restore();
    });
  }

  fullscreen(element) {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('FULLSCREEN');
      await element.requestFullscreen();
    });
  }

  moveTo(x, y) {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MOVE');
      window.moveTo(x, y);
    });
  }

  moveBy(deltaX, deltaY) {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('MOVE');
      window.moveBy(deltaX, deltaY);
    });
  }

  setResizable(canResize) {
    return this.scheduleNextOperation(async () => {
      this.setPendingOp('RESIZABLE');
      await window.setResizable(canResize);
    });
  }

  /* Private methods */
  isProgrammatic(expected) {
    if (this.pendingOperation === expected) {
      this.pendingOperation = null;
      if (this.pendingOpTimeout) clearTimeout(this.pendingOpTimeout);
      return true;
    }
    return false;
  }

  windowStateChanged(oldState, newState) {
    if (oldState === newState) return;

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

  windowMoved() {
    this.onMove?.();

    if (!this.isCurrentMoveProgrammatic) {
      this.onExternalMove?.();
    }
  }

  windowMoveStarted() {
    this.onMoveStarted?.();

    if (!this.isCurrentMoveProgrammatic) {
      this.onExternalMoveStarted?.();
    }
  }

  windowMoveEnded() {
    this.onMoveEnded?.();

    if (!this.isCurrentMoveProgrammatic) {
      this.onExternalMoveEnded?.();
    }
  }

  resizableChanged(resizable) {
    if (this.currentResizableState == resizable) {
      return;
    }

    this.onResizableChange?.(resizable);

    if (!this.isProgrammatic('RESIZABLE')) {
      this.onExternalResizableChange?.(resizable);
    }
    this.currentResizableState = resizable;
  }

  scheduleNextOperation(operation) {
    const previousTask = this.lastEventPromise.catch(() => { });
    const currentTaskPromise = previousTask.then(() => operation());
    this.lastEventPromise = currentTaskPromise;
    return currentTaskPromise;
  }

  getCurrentWindowState() {
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

  getCurrentResizableState() {
    if (window.matchMedia('(resizable: true)').matches) {
      return true;
    } else if (window.matchMedia('(resizable: false)').matches) {
      return false;
    }
    throw new Error("Error figuring out the resizable state");
  }

  registerDisplayStateHandler() {
    const bindState = (mediaQuery, state) => {
      const mq = window.matchMedia(mediaQuery);
      const listener = (e) => {
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

    const bindResizable = (mediaQuery, val) => {
      const mq = window.matchMedia(mediaQuery);
      const listener = (e) => {
        if (e.matches) this.resizableChanged(val);
      };
      mq.addEventListener('change', listener);
      this.mediaQueryCleanups.push(() => mq.removeEventListener('change', listener));
    };

    bindResizable('(resizable: true)', true);
    bindResizable('(resizable: false)', false);

    const focusListener = () => this.startMovePolling();
    const blurListener = () => this.stopMovePolling();

    window.addEventListener('focus', focusListener);
    if (document.hasFocus()) {
      this.startMovePolling();
    }
    window.addEventListener('blur', blurListener);
    this.mediaQueryCleanups.push(() => {
      window.removeEventListener('focus', focusListener);
      window.removeEventListener('blur', blurListener);
    });
  }

  startMovePolling() {
    if (this.continuePollingWindowPosition) {
      return;
    }
    this.lastX = window.screenX;
    this.lastY = window.screenY;
    this.continuePollingWindowPosition = true;
    this.animationId = requestAnimationFrame(this.requestAnimationCallback);
  }

  stopMovePolling() {
    this.continuePollingWindowPosition = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.duringMove) {
      this.windowMoveEnded();
      this.duringMove = false;
      this.isCurrentMoveProgrammatic = false;
    }
  }

  pollWindowPosition() {
    if (!this.continuePollingWindowPosition) {
      return;
    }
    const currentX = window.screenX;
    const currentY = window.screenY;
    if (currentX !== this.lastX || currentY !== this.lastY) {
      if (!this.duringMove) {
        this.isCurrentMoveProgrammatic = this.isProgrammatic('MOVE');
        this.windowMoveStarted();
        this.duringMove = true;
      }
      this.lastX = currentX;
      this.lastY = currentY;
      this.windowMoved();
    } else if (this.duringMove) {
        this.windowMoveEnded();
        this.duringMove = false;
      this.isCurrentMoveProgrammatic = false;
    }

    this.animationId = requestAnimationFrame(this.requestAnimationCallback);
  }

  setPendingOp(op) {
    this.pendingOperation = op;

    if (this.pendingOpTimeout) clearTimeout(this.pendingOpTimeout);

    this.pendingOpTimeout = window.setTimeout(() => {
      this.pendingOperation = null;
      this.pendingOpTimeout = null;
    }, 5000);
  }
}
