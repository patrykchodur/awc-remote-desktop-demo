const statusElement = document.querySelector<HTMLSpanElement>('#status')!;
const restored = () => {
  statusElement.textContent = 'Restored';
  window.opener.postMessage({type: 'RESTORE'});
};
const minimized = () => {
  statusElement.textContent = 'Minimized';
  window.opener.postMessage({type: 'MINIMIZE'});
};
const maximized = () => {
  statusElement.textContent = 'Maximized';
  window.opener.postMessage({type: 'MAXIMIZE'});
};

const fullscreen = () => {
  statusElement.textContent = 'Fullscreen';
  window.opener.postMessage({type: 'FULLSCREEN'});
};

export const WindowState = {
  Normal: 0,
  Minimized: 1,
  Maximized: 2,
  Fullscreen: 3
} as const;

export type WindowState = (typeof WindowState)[keyof typeof WindowState];

const windowStateChange = (oldState: WindowState, newState: WindowState) => {
  switch (newState) {
    case WindowState.Normal: {
      restored();
      break;
    }
    case WindowState.Fullscreen: {
      fullscreen();
      break;
    }
    case WindowState.Minimized: {
      minimized();
      break;
    }
    case WindowState.Maximized: {
      if (oldState === WindowState.Minimized || oldState === WindowState.Fullscreen) {
        restored();
      } else {
        maximized();
      }
      break;
    }
  }
}

let previousState: WindowState = WindowState.Normal;

window.matchMedia('(display-state: normal)').addEventListener('change', (e) => {
  if (e.matches) {
    windowStateChange(previousState, WindowState.Normal);
    previousState = WindowState.Normal;
  }
});
window.matchMedia('(display-state: maximized)').addEventListener('change', (e) => {
  if (e.matches) {
    windowStateChange(previousState, WindowState.Maximized);
    previousState = WindowState.Maximized;
  }
});
window.matchMedia('(display-state: minimized)').addEventListener('change', (e) => {
  if (e.matches) {
    windowStateChange(previousState, WindowState.Minimized);
    previousState = WindowState.Minimized;
  }
});
window.matchMedia('(display-state: fullscreen)').addEventListener('change', (e) => {
  if (e.matches) {
    windowStateChange(previousState, WindowState.Fullscreen);
    previousState = WindowState.Fullscreen;
  }
});









document.querySelector<HTMLButtonElement>('#minimize')!.addEventListener('click', async () => {
  await(window as any).minimize();
});

document.querySelector<HTMLButtonElement>('#maximize')!.addEventListener('click', async () => {
  await (window as any).maximize();
});

document.querySelector<HTMLButtonElement>('#restore')!.addEventListener('click', async () => {
  await (window as any).restore();
});

const resizableElement = document.querySelector<HTMLInputElement>('#resizable')!;
resizableElement.addEventListener('change', () => {
  (window as any).setResizable(resizableElement.checked);
})

const movedTimeElement = document.querySelector<HTMLSpanElement>('#movedTime')!;
const updateTimeMoved = () => {
  movedTimeElement.textContent = Date().toLocaleString();
}
(window as any).onmove = () => updateTimeMoved();







window.addEventListener('message', (event) => {
  console.log('Got message!');
  const data = event.data;
  switch (data.type) {
    case 'MOVE': {
      window.moveTo(data.screenX, data.screenY);
      break;
    }
    case 'MINIMIZE': {
      (window as any).minimize();
      break;
    }
    case 'MAXIMIZE': {
      (window as any).maximize();
      break;
    }
    case 'FULLSCREEN': {
      document.documentElement.requestFullscreen();
      break;
    }
    case 'RESTORE': {
      (window as any).restore();
      break;
    }
  }
});

(window as any).onmove = () => {
    updateTimeMoved();
    window.opener.postMessage({ type: 'WAS_MOVED', screenX: window.screenX, screenY: window.screenY});
}



// testing

