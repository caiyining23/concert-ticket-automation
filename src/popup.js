import {DEFAULT_CONFIG, normalizeConfig} from './core.js';
const $ = (id) => document.getElementById(id);
const status = (message) => {$('status').textContent = message;};
async function activeTab() {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab?.id || !/^https:\/\/(tkglobal|ticket)\.melon\.com\//.test(tab.url || '')) {
    throw new Error('Open tkglobal.melon.com or ticket.melon.com first.');
  }
  return tab;
}
async function saveConfig() {
  const config = normalizeConfig({
    selector: $('selector').value,
    maxSelections: $('count').value,
    autoSelect: $('click').checked,
    notify: $('notify').checked
  });
  await chrome.storage.local.set({config});
  return config;
}
async function control(type) {
  try {
    const tab = await activeTab();
    const config = type === 'SEATFLOW_START' ? await saveConfig() : undefined;
    const response = await chrome.tabs.sendMessage(tab.id, {type, config});
    if (!response?.ok) throw new Error('No response from seat page');
    status(type === 'SEATFLOW_START' ? 'Monitoring started. Check the seat-page DOM selector.' : 'Monitoring stopped.');
  } catch (error) {status(error.message + ' Reload the page if necessary.');}
}
$('start').addEventListener('click', () => control('SEATFLOW_START'));
$('stop').addEventListener('click', () => control('SEATFLOW_STOP'));
const saved = await chrome.storage.local.get(['config', 'lastStatus']);
const config = {...DEFAULT_CONFIG, ...saved.config};
$('selector').value = config.selector;
$('count').value = config.maxSelections;
$('click').checked = config.autoSelect;
$('notify').checked = config.notify;
if (saved.lastStatus?.detail) status(saved.lastStatus.detail);
