import { AWCController } from './awc-controller';

let childWindow: Window | null = null;
const controller = new AWCController();

const statusElement = document.querySelector<HTMLSpanElement>('#status')!;
controller.onRestore = () => {
  statusElement.textContent = 'Restored';
};
controller.onExternalRestore = () => {
  childWindow?.postMessage({type: 'RESTORE'});
};
controller.onMinimize = () => {
  statusElement.textContent = 'Minimized';
};
controller.onExternalMinimize = () => {
  childWindow?.postMessage({type: 'MINIMIZE'});
};
controller.onMaximize = () => {
  statusElement.textContent = 'Maximized';
};
controller.onExternalMaximize = () => {
  childWindow?.postMessage({type: 'MAXIMIZE'});
};
controller.onFullscreen = () => {
  statusElement.textContent = 'Fullscreen';
};
controller.onExternalFullscreen = () => {
  childWindow?.postMessage({type: 'FULLSCREEN'});
};

const spawnElement = document.querySelector<HTMLButtonElement>('#spawnWindow')!;
spawnElement.addEventListener('click', async () => {
  childWindow = window.open(
    '/child.html',
    undefined,
    `width=${window.innerWidth},height=${window.innerHeight}`)!;
});

const resizableElement = document.querySelector<HTMLInputElement>('#resizable')!;
resizableElement.addEventListener('change', () => {
  (window as any).setResizable(resizableElement.checked);
})

const movedTimeElement = document.querySelector<HTMLSpanElement>('#movedTime')!;
const updateTimeMoved = () => {
  movedTimeElement.textContent = Date().toLocaleString();
}
const childXElement = document.querySelector<HTMLInputElement>('#childX')!;
const childYElement = document.querySelector<HTMLInputElement>('#childY')!;

controller.onMove = () => {
  updateTimeMoved();
}
controller.onExternalMove = () => {
  childWindow?.postMessage({ type: 'MOVE', screenX: window.screenX + childXElement.valueAsNumber, screenY: window.screenY + childYElement.valueAsNumber });
}

window.addEventListener('message', (event) => {
  console.log('Got message!');
  const data = event.data;
  switch (data.type) {
    case 'MOVE': {
      controller.moveTo(data.screenX, data.screenY);
      break;
    }
    case 'WAS_MOVED': {
      controller.moveTo(data.screenX - childXElement.valueAsNumber, data.screenY - childYElement.valueAsNumber);
      break;
    }
    case 'MINIMIZE': {
      controller.minimize();
      break;
    }
    case 'MAXIMIZE': {
      controller.maximize();
      break;
    }
    case 'FULLSCREEN': {
      controller.fullscreen(document.documentElement);
      break;
    }
    case 'RESTORE': {
      controller.restore();
      break;
    }
  }
});

// testing
