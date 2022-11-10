import { Paper, Tab, Tabs } from "@mui/material";
import React from "react";
import CancelIcon from '@mui/icons-material/Cancel';

export default function TabWithClose() {
  const [value, setValue] = React.useState(2);
  const [hoverTab, setHoverTab] = React.useState("");

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper square>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="disabled tabs example"
      >
        <Tab onMouseEnter={() => setHoverTab("")} label="Active" />
        <Tab label="Disabled" />
        <Tab label="Active" />
        <Tab
          onMouseOver={() => setHoverTab("close")}
          onMouseLeave={() => setHoverTab("")}
          label={
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "visible",
                border: "1px dashed"
              }}
            >
              Close
              <CancelIcon
                fontSize="small"
                style={{
                  position: "absolute",
                  right: "-10px",
                  top: "-10px",
                  display: hoverTab === "close" ? "" : "none"
                }}
              />
            </div>
          }
        ></Tab>
      </Tabs>
    </Paper>
  );
}
