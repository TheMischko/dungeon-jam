export function isTypingOrInteractiveTarget(
  target: EventTarget | null
): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  const inputElements = ['INPUT', 'TEXTAREA', 'SELECT'];
  if (inputElements.includes(tag)) {
    return true;
  }

  if (target.contentEditable === 'true') {
    return true;
  }

  return !!target.closest(
    'button, a[href], [role="button"], [role="checkbox"], [role="radio"], [role="slider"], [role="tab"], [contenteditable="true"]'
  );
}
