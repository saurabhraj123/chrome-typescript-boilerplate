import React from "react";
import ReactDOM from "react-dom";
import "./popup.css";

const App: React.FC<{}> = () => {
  return (
    <div>
      <h1 className="popupHeader">Data Test Id - Inspector</h1>
      <div className="borderColorPickerContainer">
        <label htmlFor="borderColorPicker">Border color:</label>
        <input type="color" id="borderColorPicker" name="borderColorPicker" />
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
