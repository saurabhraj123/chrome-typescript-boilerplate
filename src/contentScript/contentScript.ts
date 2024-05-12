/** Internal */
import {
  getBorderColorFromChromeStorage,
  getShowCopyIconFromChromeStorage,
} from "../lib/utils";
import {
  BORDER_COLOR_UPDATE,
  DEFAULT_BORDER_COLOR,
  GET_INSPECT_STATUS,
  SHOW_COPY_ICON,
  TOGGLE_INSPECT,
} from "../lib/constants";

/** Global variables */
let isInspecting = false;
let borderColor: string;
let showCopyIcon: boolean;

getBorderColorFromChromeStorage()
  .then((color: string) => (borderColor = color))
  .catch(() => (borderColor = DEFAULT_BORDER_COLOR));

getShowCopyIconFromChromeStorage()
  .then((showIcon: boolean) => (showCopyIcon = showIcon))
  .catch(() => (showCopyIcon = true));

// Create a MutationObserver to listen for changes to the DOM
const observer = new MutationObserver(function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (
      mutation.type === "childList" &&
      isInspecting &&
      mutation.addedNodes.length > 0 &&
      mutation.target instanceof HTMLElement &&
      !(mutation.target.className === "copyButton") &&
      !mutation.target.contains(document.querySelector(".copyButton"))
    ) {
      observer.disconnect();
      applyBorderToElementsWithTestId(borderColor);
      break;
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
    case SHOW_COPY_ICON:
      const { showCopyIcon: showIcon } = message.payload || {};
      showCopyIcon = showIcon;
      break;
  }
});

const applyBorderToElementsWithTestId = (color: string) => {
  const elements = document.querySelectorAll(
    "[data-test-id]"
  ) as NodeListOf<HTMLElement>;

  elements.forEach((element) => {
    const testId = element.getAttribute("data-test-id");
    element.style.border = `2px solid ${color}`;
    element.title = testId;

    element.addEventListener("mouseenter", addCopyButton);
    element.addEventListener("mouseleave", removeCopyButton);
  });

  observer.observe(document.body, { subtree: true, childList: true });
};

const removeCopyButton = () => {
  const copyButtons = document.querySelectorAll(".copyButton");
  copyButtons.forEach((button) => button.remove());
};

const offsetParentHasTransformProperty = (element: HTMLElement) => {
  const parent = element.offsetParent;
  const parentStyles = getComputedStyle(parent);
  return parentStyles.transform !== "none";
};

const addCopyButton = (e: MouseEvent) => {
  removeCopyButton();
  if (!showCopyIcon) return;

  const element = e.target as HTMLElement;
  const elementRect = element.getBoundingClientRect();

  const testId = element.getAttribute("data-test-id");
  const copyButton = createCopyButton(testId);
  copyButton.style.zIndex = "999999999999";
  copyButton.classList.add("copyButton");

  if (offsetParentHasTransformProperty(element)) {
    copyButton.style.position = "absolute";
    copyButton.style.top = `${element.offsetTop}px`;
    copyButton.style.left = `${element.offsetLeft}px`;
  } else {
    copyButton.style.position = "fixed";
    copyButton.style.top = `${elementRect.top}px`;
    copyButton.style.left = `${elementRect.left}px`;
    copyButton.style.width = "fit-content";
  }
  element.appendChild(copyButton);
};

const createCopyButton = (testId: string) => {
  const button = document.createElement("button");
  button.textContent = "Copy";
  button.style.background = "red";
  button.style.color = "white";

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    copyTestId(testId);
    button.textContent = "Copied!";
    setTimeout(() => (button.textContent = "Copy"), 1000);
  });

  return button;
};

const copyTestId = (testId: string) => {
  navigator.clipboard
    .writeText(testId)
    .then(() => console.log("Test ID copied to clipboard"))
    .catch((err) => console.error("Failed to copy test ID:", err));
};

const removeBorderFromElementsWithTestId = () => {
  const elementsWithTestId = document.querySelectorAll(
    "[data-test-id]"
  ) as NodeListOf<HTMLElement>;

  elementsWithTestId.forEach((element) => {
    element.style.border = null;
    element.title = "";
    element.removeEventListener("mouseenter", addCopyButton);
    element.removeEventListener("mouseleave", removeCopyButton);
  });

  document.querySelector(".copyButton")?.remove();

  observer.disconnect();
};
