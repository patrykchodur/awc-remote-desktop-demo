/* helper for testing */ const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
(window as any).sleep = sleep;

const getDisplayState = () => {
  if (window.matchMedia('(display-state: maximized)').matches) {
    return 'maximized';
  } else if (window.matchMedia('(display-state: minimized)').matches) {
    return 'minimized';
  } else if (window.matchMedia('(display-state: fullscreen)').matches) {
    return 'fullscreen';
  } else if (window.matchMedia('(display-state: normal)').matches) {
    return 'normal';
  }
}

const countElement = document.querySelector<HTMLSpanElement>('#count')!;

const currentCount = () => Number(countElement.textContent);
const updateCount = (count: number) =>
  (countElement.textContent = count.toString())

document.querySelector<HTMLButtonElement>('#increment')!.addEventListener('click', () => {
  updateCount(currentCount() + 1);
});

document.querySelector<HTMLButtonElement>('#decrement')!.addEventListener('click', () => {
  updateCount(currentCount() - 1);
});

document.querySelector<HTMLButtonElement>('#reset')!.addEventListener('click', () => {
  updateCount(0);
});

document.querySelector<HTMLButtonElement>('#minimize')!.addEventListener('click', async () => {
  console.log(`before minimize: diplay-state = ${getDisplayState()}, inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  await(window as any).minimize();
  console.log(`after minimize: diplay-state = ${getDisplayState()}, inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
});

document.querySelector<HTMLButtonElement>('#maximize')!.addEventListener('click', async () => {
  console.log(`before maximize: diplay-state = ${getDisplayState()}, inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  await (window as any).maximize();
  console.log(`after maximize: diplay-state = ${getDisplayState()}, inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
});

document.querySelector<HTMLButtonElement>('#restore')!.addEventListener('click', async () => {
  console.log(`before restore: diplay-state = ${getDisplayState()}, inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  await (window as any).restore();
  console.log(`after restore: diplay-state = ${getDisplayState()}, inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
});

document.querySelector<HTMLButtonElement>('#moveToCorner')!.addEventListener('click', () => {
  (window as any).moveTo(3000, 3000);
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
