import { AWCController } from './awc-controller';

const controller = new AWCController();

const statusElement = document.querySelector<HTMLSpanElement>('#status')!;
controller.onRestore = () => {
  statusElement.textContent = 'Restored';
};
controller.onExternalRestore = () => {
  window.opener.postMessage({type: 'RESTORE'});
};
controller.onMinimize = () => {
  statusElement.textContent = 'Minimized';
};
controller.onExternalMinimize = () => {
  window.opener.postMessage({type: 'MINIMIZE'});
};
controller.onMaximize = () => {
  statusElement.textContent = 'Maximized';
};
controller.onExternalMaximize = () => {
  window.opener.postMessage({type: 'MAXIMIZE'});
};

controller.onFullscreen = () => {
  statusElement.textContent = 'Fullscreen';
};
controller.onExternalFullscreen = () => {
  window.opener.postMessage({type: 'FULLSCREEN'});
};


document.querySelector<HTMLButtonElement>('#minimize')!.addEventListener('click', async () => {
  await controller.minimize();
});

document.querySelector<HTMLButtonElement>('#maximize')!.addEventListener('click', async () => {
  await controller.maximize();
});

document.querySelector<HTMLButtonElement>('#restore')!.addEventListener('click', async () => {
  await controller.restore();
});

const resizableElement = document.querySelector<HTMLInputElement>('#resizable')!;
resizableElement.addEventListener('change', () => {
   controller.setResizable(resizableElement.checked);
})

const movedTimeElement = document.querySelector<HTMLSpanElement>('#movedTime')!;
const updateTimeMoved = () => {
  movedTimeElement.textContent = Date().toLocaleString();
}
controller.onMove = () => updateTimeMoved();
controller.onExternalMove = () => {
  window.opener.postMessage({ type: 'WAS_MOVED', screenX: window.screenX, screenY: window.screenY});
}

window.addEventListener('message', (event) => {
  const data = event.data;
  switch (data.type) {
    case 'MOVE': {
      controller.moveTo(data.screenX, data.screenY);
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
      console.log("pchodur - restored");
      controller.restore();
      break;
    }
  }
});

// testing

