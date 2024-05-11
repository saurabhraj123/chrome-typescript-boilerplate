/** Internal */
import { getBorderColorFromChromeStorage } from "../lib/utils";
import {
  BORDER_COLOR_UPDATE,
  DEFAULT_BORDER_COLOR,
  GET_INSPECT_STATUS,
  TOGGLE_INSPECT,
} from "../lib/constants";

/** Global variables */
let isInspecting = false;
let borderColor: string;
getBorderColorFromChromeStorage()
  .then((color: string) => (borderColor = color))
  .catch(() => (borderColor = DEFAULT_BORDER_COLOR));

// Create a MutationObserver to listen for changes to the DOM
const observer = new MutationObserver(function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      // If nodes are added or removed, apply border to elements with test IDs
      applyBorderToElementsWithTestId(borderColor);
    }
  }
});

/** Message listener(s) */
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.action) {
    case TOGGLE_INSPECT:
      isInspecting = !isInspecting;

      // add or remove border color
      isInspecting
        ? applyBorderToElementsWithTestId(borderColor)
        : removeBorderFromElementsWithTestId();

      break;
    case BORDER_COLOR_UPDATE:
      const { borderColor: updatedBorderColor } = message.payload || {};
      borderColor = updatedBorderColor;
      if (isInspecting) applyBorderToElementsWithTestId(borderColor);
      break;
    case GET_INSPECT_STATUS:
      sendResponse(isInspecting);
      break;
  }
});

const applyBorderToElementsWithTestId = (color: string) => {
  const elements = document.querySelectorAll(
    "[data-test-id]"
  ) as NodeListOf<HTMLElement>;

  elements.forEach((element) => {
    element.style.border = `2px solid ${color}`;
  });

  observer.observe(document.body, { subtree: true, childList: true });
};

const removeBorderFromElementsWithTestId = () => {
  const elementsWithTestId = document.querySelectorAll(
    "[data-test-id]"
  ) as NodeListOf<HTMLElement>;

  elementsWithTestId.forEach((element) => {
    element.style.border = null;
  });

  observer.disconnect();
};
