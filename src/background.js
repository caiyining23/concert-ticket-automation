const lastNotification = new Map();
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'SEATFLOW_STATUS' && sender.tab?.id !== undefined) {
    chrome.storage.local.set({lastStatus: {count: message.count, detail: message.detail, url: message.url, at: Date.now()}});
    chrome.action.setBadgeText({tabId: sender.tab.id, text: message.count > 0 ? String(message.count) : ''}).catch(() => {});
    chrome.action.setBadgeBackgroundColor({tabId: sender.tab.id, color: '#15803d'}).catch(() => {});
  }
  if (message.type === 'SEATFLOW_NOTIFY' && sender.tab?.id !== undefined) {
    const previous = lastNotification.get(sender.tab.id) || 0;
    if (Date.now() - previous < 10000) return;
    lastNotification.set(sender.tab.id, Date.now());
    chrome.notifications.create(`seatflow-${sender.tab.id}-${Date.now()}`, {
      type: 'basic', title: 'SeatFlow: Seats detected',
      message: `${message.count} seat(s) match your selector. Open Melon Ticket to review.`,
      iconUrl: 'assets/icon128.png'
    }).catch(() => {});
  }
});
