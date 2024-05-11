export const getBorderColorFromChromeStorage = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("borderColor", (result) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(result.borderColor);
    });
  });
};

export const sendMessageToContentScript = (message: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
};
