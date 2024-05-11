import { GET_INSPECT_STATUS } from "./constants";

export const getBorderColorFromChromeStorage = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("borderColor", (result) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(result.borderColor);
    });
  });
};

export const getInspectStatusFromContentScript = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: GET_INSPECT_STATUS },
        (response) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(response);
        }
      );
    });
  });
};

export const sendMessageToContentScript = (message: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
};
