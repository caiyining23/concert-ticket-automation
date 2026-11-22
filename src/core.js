export const DEFAULT_CONFIG = Object.freeze({
  selector: '[data-seat-status="available"], .seat.available, [aria-label*="available" i]',
  maxSelections: 1,
  autoSelect: false,
  notify: true,
  minimumIntervalMs: 2000
});

export function normalizeConfig(candidate = {}) {
  const selector = String(candidate.selector || DEFAULT_CONFIG.selector).trim();
  if (!selector || selector.length > 500) throw new Error('Seat CSS selector is required (max 500 chars)');
  const maxSelections = Math.min(4, Math.max(1, Math.trunc(Number(candidate.maxSelections) || 1)));
  return {
    selector,
    maxSelections,
    autoSelect: candidate.autoSelect === true,
    notify: candidate.notify !== false,
    minimumIntervalMs: Math.max(2000, Math.trunc(Number(candidate.minimumIntervalMs) || 2000))
  };
}

export function matchesAvailableSeat(element) {
  if (!element || element.getAttribute('aria-disabled') === 'true') return false;
  if (element.matches('[disabled], [hidden], [aria-hidden="true"]')) return false;
  const style = globalThis.getComputedStyle?.(element);
  if (style && (style.visibility === 'hidden' || style.display === 'none')) return false;
  return element.getClientRects?.().length > 0;
}

export function selectCandidates(elements, count) {
  return Array.from(elements).filter(matchesAvailableSeat).slice(0, count);
}

export function compactStatus(count, mode) {
  return count > 0 ? `${count} available seat(s) detected — ${mode}` : 'No matching available seats detected';
}
