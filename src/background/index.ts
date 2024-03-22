chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

let isBlockingEnabled = false;
chrome.action.onClicked.addListener(function(tab) {
  isBlockingEnabled = !isBlockingEnabled;
  chrome.browserAction.setIcon({ path: isBlockingEnabled ? "icon_active.png" : "icon.png", tabId: tab.id });
  if (tab && tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { blockingEnabled: isBlockingEnabled });
  }
});