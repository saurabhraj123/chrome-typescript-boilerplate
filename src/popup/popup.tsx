/** External */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

/** Internal */
import "./popup.css";
import { BORDER_COLOR_UPDATE, DEFAULT_BORDER_COLOR } from "../lib/constants";
import {
  sendMessageToContentScript,
  getBorderColorFromChromeStorage,
} from "../lib/utils";

const App: React.FC<{}> = () => {
  const [borderColor, setBorderColor] = useState<string>(DEFAULT_BORDER_COLOR);

  useEffect(() => {
    getBorderColorFromChromeStorage().then((color: string) => {
      setBorderColor(color);
    });
  }, []);

  useEffect(() => {
    sendMessageToContentScript({
      action: BORDER_COLOR_UPDATE,
      payload: { borderColor },
    });
  }, [borderColor]);

  const handleColorInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const color = event.target.value;
    console.log("handleColorInputChange");
    setBorderColor(color);
  };

  const saveBorderColorToChromeStorage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const color = event.target.value;
    console.log("saveBorderColorToChromeStorage");
    chrome.storage.sync.set({ borderColor: color });
  };

  return (
    <div>
      <h1 className="popupHeader">Data Test Id - Inspector</h1>
      <div className="borderColorPickerContainer">
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

      <div className="copyIconCheckboxContainer">
        <label htmlFor="copyIconCheckbox">Show copy icon on hover:</label>
        <input type="checkbox" id="copyIconCheckbox" name="copyIconCheckbox" />
      </div>

      <div className="buttonsContainer">
        <button id="inspectButton">Start</button>
        <button id="findDuplicates">Find duplicates</button>
        <button id="findMissing">Find missing</button>
      </div>
    </div>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
