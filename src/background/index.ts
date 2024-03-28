chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'chatGptApiRequest') {
    chrome.tabs.captureVisibleTab(null as any, {}, (dataUrl) => {
      const base64Image = dataUrl.split(',')[1]
      // call chatgpt api here and send message
      const response = 'yep we got the message'
      // @ts-expect-error
      chrome.tabs.sendMessage(sender.tab.id, { action: 'chatGptResponse', response })
    })
  }
})
