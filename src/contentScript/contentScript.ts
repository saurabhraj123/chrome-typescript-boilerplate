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

/** Message listener(s) */
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.action) {
    case TOGGLE_INSPECT:
      isInspecting = !isInspecting;
      console.log({ isInspecting });

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
};

function removeBorderFromElementsWithTestId() {
  const elementsWithTestId = document.querySelectorAll(
    "[data-test-id]"
  ) as NodeListOf<HTMLElement>;

  elementsWithTestId.forEach((element) => {
    element.style.border = null;
  });
}
