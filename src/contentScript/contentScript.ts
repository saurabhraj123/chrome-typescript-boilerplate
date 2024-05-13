/** Internal */
import {
  getBorderColorFromChromeStorage,
  getShowCopyIconFromChromeStorage,
  isCtrlShiftPressed,
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
let elementTestIdCountMap: { [key: string]: number } = {};

getBorderColorFromChromeStorage()
  .then((color: string) => {
    borderColor = color || DEFAULT_BORDER_COLOR;
  })
  .catch(() => (borderColor = DEFAULT_BORDER_COLOR));

getShowCopyIconFromChromeStorage()
  .then((showIcon: boolean) => {
    showCopyIcon = showIcon || true;
  })
  .catch(() => (showCopyIcon = true));

// event listener
document.addEventListener("keydown", (event) => {
  if (isCtrlShiftPressed(event) && event.key == "z") {
    isInspecting = !isInspecting;
    isInspecting
      ? applyBorderToElementsWithTestId(borderColor)
      : removeBorderFromElementsWithTestId();
  } else if (isCtrlShiftPressed(event) && event.key == "x") {
    showCopyIcon = !showCopyIcon;
    if (!showCopyIcon) removeCopyButton();
    chrome.storage.sync.set({ showCopyIcon });
  }
});

// Create a MutationObserver to listen for changes to the DOM
const observer = new MutationObserver(function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (
      mutation.type === "childList" &&
      isInspecting &&
      mutation.addedNodes.length > 0 &&
      mutation.target instanceof HTMLElement &&
      !(mutation.target.className === "testIdExtensionButton") &&
      !mutation.target.contains(
        document.querySelector(".testIdExtensionButton")
      )
    ) {
      observer.disconnect();
      elementTestIdCountMap = {};
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

  fillTestIdHashTable(elements);

  elements.forEach((element) => {
    const testId = element.getAttribute("data-test-id");
    const testIdCount = elementTestIdCountMap[testId];

    element.title = testId;
    element.style.border =
      !testId || testIdCount > 1 ? `4px dotted ${color}` : `2px solid ${color}`;

    element.addEventListener("mouseenter", addCopyButton);
    element.addEventListener("mouseleave", removeCopyButton);
  });

  observer.observe(document.body, { subtree: true, childList: true });
};

const fillTestIdHashTable = (elements: NodeListOf<HTMLElement>) => {
  elementTestIdCountMap = {};
  elements.forEach((element) => {
    const testId = element.getAttribute("data-test-id");
    if (testId)
      elementTestIdCountMap[testId] = elementTestIdCountMap[testId] + 1 || 1;
  });
};

const removeCopyButton = () => {
  const copyButtons = document.querySelectorAll(".testIdExtensionButton");
  copyButtons.forEach((button) => button.remove());
};

const offsetParentHasTransformProperty = (element: HTMLElement) => {
  const parent = element.offsetParent;
  if (!parent) return false;
  const parentStyles = getComputedStyle(parent);
  return parentStyles.transform !== "none";
};

const addCopyButton = (e: MouseEvent) => {
  removeCopyButton();
  if (!showCopyIcon) return;

  const element = e.target as HTMLElement;
  if (element.classList.contains("testIdExtensionButton")) return;

  const testId = element.getAttribute("data-test-id");
  const copyButton = createCopyButton(testId);

  addButtonToCurrentElement(element, copyButton);
};

const addButtonToCurrentElement = (
  element: HTMLElement,
  button: HTMLElement
) => {
  const elementRect = element.getBoundingClientRect();

  if (offsetParentHasTransformProperty(element)) {
    button.style.position = "absolute";
    button.style.top = `${element.offsetTop}px`;
    button.style.left = `${element.offsetLeft}px`;
  } else {
    button.style.position = "fixed";
    if (elementRect.top < 0 || elementRect.left < 0) {
      setTimeout(() => addButtonToCurrentElement(element, button), 100);
      return;
    }
    button.style.top = `${elementRect.top}px`;
    button.style.left = `${elementRect.left}px`;
    button.style.width = "fit-content";
  }
  element.appendChild(button);
};

const createCopyButton = (testId: string) => {
  const button = document.createElement("button");
  button.textContent = "Copy";
  button.style.background = "#f5f5f5"; /* Light gray background */
  button.style.color = "#333333"; /* Dark gray text */
  button.style.border = "1px solid #cccccc"; /* Light gray border */
  button.style.padding = "5px 10px"; /* Adjust padding as needed */
  button.style.borderRadius = "5px"; /* Optional - Round the corners */
  button.style.fontSize = "12px";
  button.style.fontWeight = "normal";
  button.style.cursor = "pointer";
  button.style.zIndex = "999999999999";
  button.classList.add("testIdExtensionButton");

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

  document.querySelector(".testIdExtensionButton")?.remove();

  observer.disconnect();
};
