/** External */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

/** Internal */
import "./popup.css";
import {
  BORDER_COLOR_UPDATE,
  DEFAULT_BORDER_COLOR,
  TOGGLE_INSPECT,
} from "../lib/constants";
import {
  sendMessageToContentScript,
  getBorderColorFromChromeStorage,
  getInspectStatusFromContentScript,
  getShowCopyIconFromChromeStorage,
  sendShowCopyIconToContentScript,
  isCtrlShiftPressed,
} from "../lib/utils";

const App: React.FC<{}> = () => {
  const [borderColor, setBorderColor] = useState<string>(DEFAULT_BORDER_COLOR);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [showCopyIcon, setShowCopyIcon] = useState<boolean>(false);

  useEffect(() => {
    getBorderColorFromChromeStorage().then((color: string) => {
      setBorderColor(color || DEFAULT_BORDER_COLOR);
    });

    getInspectStatusFromContentScript().then((inspectStatus: boolean) => {
      setIsInspecting(inspectStatus);
    });

    getShowCopyIconFromChromeStorage().then((showCopyIcon: boolean) => {
      setShowCopyIcon(showCopyIcon || true);
    });
  }, []);

  useEffect(() => {
    sendMessageToContentScript({
      action: BORDER_COLOR_UPDATE,
      payload: { borderColor },
    });
  }, [borderColor]);

  const handleShortcuts = (event: KeyboardEvent) => {
    if (isCtrlShiftPressed(event) && event.key == "z") {
      handleStartStopClick();
    } else if (isCtrlShiftPressed(event) && event.key == "x") {
      handleShowCopyIconClick();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleShortcuts);

    return () => {
      document.removeEventListener("keydown", handleShortcuts);
    };
  }, [showCopyIcon]);

  const handleColorInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const color = event.target.value;
    setBorderColor(color);
  };

  const saveBorderColorToChromeStorage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const color = event.target.value;
    chrome.storage.sync.set({ borderColor: color });
  };

  const handleStartStopClick = () => {
    setIsInspecting((prev) => !prev);
    sendMessageToContentScript({ action: TOGGLE_INSPECT });
  };

  const handleShowCopyIconClick = () => {
    chrome.storage.sync.set({ showCopyIcon: !showCopyIcon });
    sendShowCopyIconToContentScript(!showCopyIcon);
    setShowCopyIcon((prev) => !prev);
  };

  return (
    <div className="container">
      <h1 className="popupHeader">Data Test Id - Inspector</h1>
      <div className="separator"> </div>
      <div
        className="borderColorPickerContainer"
        title="Border color for test-id divs"
      >
        <label htmlFor="borderColorPicker">Border color:</label>
        <input
          type="color"
          id="borderColorPicker"
          name="borderColorPicker"
          value={borderColor}
          onBlur={saveBorderColorToChromeStorage}
          onChange={handleColorInputChange}
        />
      </div>

      <div className="copyIconCheckboxContainer" title="cmd/ctrl + shift + x">
        <label htmlFor="copyIconCheckbox">Show copy icon on hover:</label>
        <input
          type="checkbox"
          id="copyIconCheckbox"
          name="copyIconCheckbox"
          checked={showCopyIcon}
          onChange={handleShowCopyIconClick}
        />
      </div>

      <div className="buttonsContainer">
        <button
          id="inspectButton"
          onClick={handleStartStopClick}
          title="cmd/ctrl + shift + z"
        >
          {isInspecting ? "Stop Inspecting" : "Start Inspecting"}
        </button>
      </div>
    </div>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
