/* Content script: inspect DOM only. No API polling, captcha automation, or checkout actions. */
(() => {
  const DEFAULT = {
    selector: '[data-seat-status="available"], .seat.available, [aria-label*="available" i]',
    maxSelections: 1,
    autoSelect: false,
    notify: true,
    minimumIntervalMs: 2000
  };
  let config = {...DEFAULT};
  let running = false;
  let observer = null;
  let timer = null;
  let selected = new WeakSet();
  let lastCount = 0;
  let lastNotify = 0;

  const available = (el) => {
    if (el.matches('[disabled], [hidden], [aria-hidden="true"]')) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
  };
  const send = (type, data = {}) => chrome.runtime.sendMessage({type, ...data}).catch(() => {});
  const report = (count, detail) => send('SEATFLOW_STATUS', {count, detail, url: location.href});
  function scan() {
    if (!running) return;
    let elements = [];
    try { elements = [...document.querySelectorAll(config.selector)].filter(available); }
    catch { report(0, 'Invalid selector — update extension settings'); return; }
    const count = elements.length;
    if (count !== lastCount) {
      report(count, count ? `${count} seat(s) visible` : 'Monitoring page');
      if (count && config.notify && Date.now() - lastNotify > 10000) {
        send('SEATFLOW_NOTIFY', {count}); lastNotify = Date.now();
      }
      lastCount = count;
    }
    if (config.autoSelect && count) {
      let clicked = 0;
      for (const el of elements) {
        if (clicked >= config.maxSelections) break;
        if (selected.has(el)) continue;
        selected.add(el);
        el.click(); clicked++;
      }
      if (clicked) {
        report(count, `Selected ${clicked} visible seat(s). Complete any checks and checkout manually.`);
        stop();
      }
    }
  }
  function schedule() {
    if (!running || timer) return;
    timer = setTimeout(() => {timer = null; scan();}, config.minimumIntervalMs);
  }
  function stop() {
    running = false;
    observer?.disconnect(); observer = null;
    if (timer) clearTimeout(timer);
    timer = null;
    report(lastCount, 'Stopped');
  }
  async function start(settings) {
    stop();
    config = {...DEFAULT, ...settings};
    if (typeof config.selector !== 'string' || !config.selector.trim()) {
      report(0, 'Missing selector'); return;
    }
    config.maxSelections = Math.min(4, Math.max(1, Number(config.maxSelections) || 1));
    config.minimumIntervalMs = Math.max(2000, Number(config.minimumIntervalMs) || 2000);
    selected = new WeakSet(); lastCount = -1; running = true;
    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'aria-disabled', 'style']});
    scan();
    report(lastCount, config.autoSelect ? 'Watching — click mode enabled' : 'Watching — notify only');
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SEATFLOW_START') { start(message.config); sendResponse({ok: true}); }
    if (message.type === 'SEATFLOW_STOP') { stop(); sendResponse({ok: true}); }
    if (message.type === 'SEATFLOW_PING') sendResponse({ok: true, running, count: lastCount});
  });
})();
