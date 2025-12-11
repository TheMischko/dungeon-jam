export function addAppInitClass(ready: boolean): void {
  if (!ready) {
    return;
  }
  document.querySelector('app-root')?.classList.add('initialized');
}
