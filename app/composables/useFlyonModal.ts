export function useFlyonModal(overlayRef: Ref<HTMLElement | null>) {
  const getHS = () => (window as any)?.HSOverlay as any | undefined;

  const getInstance = () => {
    const HS = getHS();
    if (!HS?.getInstance) return null;
    try {
      const raw = HS.getInstance(overlayRef.value, true);
      // FlyonUI/Preline may wrap instance under different keys
      const inst = raw?.element || raw?.overlay || raw || null;
      return inst;
    } catch {
      return null;
    }
  };

  const open = () => {
    const HS = getHS();
    const inst = getInstance();
    if (inst?.open) {
      inst.open();
    } else {
      HS?.open?.(overlayRef.value);
    }
  };

  const close = async () => {
    const HS = getHS();
    const inst = getInstance();

    // Prepare a safe waiter that always resolves
    const waitClosed = new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };

      try {
        if (typeof inst?.on === "function") {
          inst.on("close", () => done());
        } else {
          // If there's no event API, resolve immediately to avoid deadlocks
          done();
        }
      } catch {
        done();
      }
    });

    // Try instance close first, then static
    if (typeof inst?.close === "function") {
      try {
        inst.close();
      } catch {
        HS?.close?.(overlayRef.value);
      }
    } else {
      HS?.close?.(overlayRef.value);
    }

    await waitClosed;

    // Defensive cleanup in case library didn't finish
    try {
      inst?.backdrop?.remove?.();
    } catch {}

    document.documentElement.classList.remove("overlay-open", "modal-open");
    document.body.classList.remove("overlay-open", "modal-open");
  };

  return { open, close, getInstance };
}
