/** Internal */
import { getBorderColorFromChromeStorage } from "../lib/utils";
import { BORDER_COLOR_UPDATE, DEFAULT_BORDER_COLOR } from "../lib/constants";

/** Global variables */
let borderColor: string;
getBorderColorFromChromeStorage()
  .then((color: string) => (borderColor = color))
  .catch(() => (borderColor = DEFAULT_BORDER_COLOR));

/** Message listener(s) */
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === BORDER_COLOR_UPDATE) {
    const { borderColor: updatedBorderColor } = message.payload || {};
    borderColor = updatedBorderColor;
    // add condition for only when start is there, should call
    applyBorderToElementsWithTestId(borderColor);
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
