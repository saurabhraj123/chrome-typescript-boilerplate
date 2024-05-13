import { GET_INSPECT_STATUS, SHOW_COPY_ICON } from "./constants";

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

export const sendShowCopyIconToContentScript = (showCopyIcon: boolean) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: SHOW_COPY_ICON,
        payload: { showCopyIcon },
      });
    });
  });
};

export const getShowCopyIconFromChromeStorage = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("showCopyIcon", (result) => {
      console.log({ result });
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(result.showCopyIcon);
    });
  });
};

export const sendMessageToContentScript = (message: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
};

export const isCtrlShiftPressed = (event: KeyboardEvent) => {
  return (event.metaKey || event.ctrlKey) && event.shiftKey;
};
