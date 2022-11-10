import React, { useState } from "react";
import { useHistory } from "react-router";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import DynamicAutoComplete from "./DynamicAutoComplete";
import PreviewImgBefUpload from "./PreviewImgBefUpload";
import PreviewTextBefUpload from "./PreviewTextBefUpload";
import InfiniteScroll from "./infinitescroll/InfiniteScrolll";
import TabWithClose from "./TabWithClose";
import TimeLine from "./timeline/TimeLine";
import TheGrid from "./aggrid/TheGrid";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button, Menu, MenuItem } from "@mui/material";
import OneClickButtonDemo from './OneClickButtonDemo'
import { Scanner } from "./webcam/Webcam";
import TimeLineA from "./d3timeline/TimeLineA";
import OCR from "./ocr/OCR";
import CropperTest from "./ocr/CropperTest";
import OCR3 from "./ocr/OCR3";
import Tesseract from "tesseract.js";

const App = () => {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [text, setText] = useState('')

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onExamineResult = async (result: Tesseract.RecognizeResult) => {
    const l = result.data.lines.find(line => line.text.startsWith("Id:"))
    if (l) {
      setText(l.text)
      return true
    };
    return false;
  }

  return (
    <Router>
      <div>
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          Start from here:)
        </Button>

        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}><Link to="/">Home</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/dac">DynamicAutoComplete</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/pibu">Preview Img before Upload</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/ptbu">Preview Text before Upload</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/infinitescroll">Infinite Scroll</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/tabwithclose">Tab With Close</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/timeline">TimeLine</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/timelinea">TimeLine-A</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/aggrid">Ag Grid workorder res crew</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/ocbutton">One Click Button Demo</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/scanner">Scanner(Zxing)</Link></MenuItem>
          <MenuItem onClick={handleClose}><Link to="/ocr">OCR</Link></MenuItem>
          <MenuItem onClick={handleClose}></MenuItem>
        </Menu>
      </div>

      <Switch>
        <Route path="/ocbutton" component={OneClickButtonDemo} />
        <Route exact path="/dac" component={DynamicAutoComplete} />
        <Route path="/pibu" component={PreviewImgBefUpload} />
        <Route path="/ptbu" component={PreviewTextBefUpload} />
        <Route path="/infinitescroll" component={InfiniteScroll} />
        <Route path="/tabwithclose" component={TabWithClose} />
        <Route path="/timeline" component={TimeLine} />
        <Route path="/timelinea" component={TimeLineA} />
        <Route path="/scanner" component={Scanner} />
        <Route path="/ocr"  >
          <div>
            <div>{`Result: ${text}`}</div>
            <OCR onExamineResult={onExamineResult} />
          </div>

        </Route>
        <DndProvider backend={HTML5Backend}>
          <Route path="/aggrid" component={TheGrid} />
        </DndProvider>

      </Switch>
    </Router>
  );
};

export default App;
