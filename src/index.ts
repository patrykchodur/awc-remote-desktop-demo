/* testing */ const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(window as any).sleep = sleep;

const statusElement = document.querySelector<HTMLSpanElement>('#status')!;

document.querySelector<HTMLButtonElement>('#minimize')!.addEventListener('click', async () => {
  console.log(`before minimize: inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  await(window as any).minimize();
  console.log(`after minimize: diplay-state matches = ${window.matchMedia('(display-state: minimized)').matches}, inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  statusElement.textContent = "Minimized successfully";
});

document.querySelector<HTMLButtonElement>('#maximize')!.addEventListener('click', async () => {
  console.log(`before maximize: inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  await (window as any).maximize();
  console.log(`after maximize: inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  statusElement.textContent = "Maximized successfully";
});

document.querySelector<HTMLButtonElement>('#restore')!.addEventListener('click', () => {
  /* testing */ console.log(`before restore: inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`);
  (window as any).restore().then( () =>
  /* testing */ console.log(`after restore: inner height = ${window.innerHeight}, inner width = ${window.innerWidth}`));
  statusElement.textContent = "Restored successfully";
});

document.querySelector<HTMLButtonElement>('#moveToCorner')!.addEventListener('click', () => {
  (window as any).moveTo(0, 0);
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

// testing