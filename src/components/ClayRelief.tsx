import { useEffect } from 'react';
import { installClayRelief, type ClayReliefOptions } from '../utils/clayRelief';
import { renderClayRelief } from '../utils/clayReliefRenderer';

export interface ClayReliefProps extends Omit<ClayReliefOptions, 'render'> {
  render?: ClayReliefOptions['render'];
  root?: Document | HTMLElement | ShadowRoot | null;
  enabled?: boolean;
}

/** Background adapter with no wrapper node or animation frame loop. */
export function ClayRelief({ root, enabled = true, render = renderClayRelief, selector, maxCacheBytes, maxCacheEntries, maxBitmapPixels, maxDeviceScale, batchBudgetMs, onError }: ClayReliefProps) {
  useEffect(() => {
    if (!enabled || root === null || typeof document === 'undefined') return;
    return installClayRelief(root ?? document, { render, selector, maxCacheBytes, maxCacheEntries, maxBitmapPixels, maxDeviceScale, batchBudgetMs, onError }).dispose;
  }, [root, enabled, render, selector, maxCacheBytes, maxCacheEntries, maxBitmapPixels, maxDeviceScale, batchBudgetMs, onError]);
  return null;
}
