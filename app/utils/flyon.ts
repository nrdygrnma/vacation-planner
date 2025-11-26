export function refreshFlyonOverlays() {
  const HS: any = (window as any).HSOverlay;
  HS?.autoInit?.();
  document.querySelectorAll(".overlay").forEach((el) => {
    try {
      const raw = HS?.getInstance?.(el, true);
      const inst = raw?.element || raw?.overlay || raw;
      inst?.updateToggles?.();
    } catch {}
  });
}
