// import { OpenAIClient } from '../api/chatGptClient'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("background listener active")
  if (message.action === 'chatGptApiRequest') {
    chrome.tabs.captureVisibleTab(null as any, {}, (dataUrl) => {
      const base64Image = dataUrl.split(',')[1]
      // call chatgpt api here and send message
      console.log("HEREEEE")
      console.log(message)
      const response =
        'You can reduce the interval duration (20 milliseconds) to a smaller value to make the typewriter effect print faster. For example, you can try reducing it to 10 milliseconds or even smaller values like 5 milliseconds. However, keep in mind that reducing the interval duration too much may impact performance, so its essential to find a balance between speed and performance.'
      // @ts-expect-error
      chrome.tabs.sendMessage(sender.tab.id, { action: 'chatGptResponse', response })
    })
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.startsWith('https://www.figma.com/board/')) {
    chrome.action.enable(tabId); // Enable the popup on Figma pages
  } else {
    chrome.action.disable(tabId); // Disable the popup elsewhere
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.startsWith('https://www.figma.com/board/')) {
      chrome.action.enable(tab.id);
    } else {
      chrome.action.disable(tab.id);
    }
  });
});
