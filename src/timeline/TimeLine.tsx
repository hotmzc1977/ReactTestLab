import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function TimeLine() {
  const c = useLocation();

  return (
    <div
      style={{
        border: "1px solid violet",
        height: "80px",
        width: "80%",
        position: "relative"
      }}
    >
      <div
        style={{
          width: "50%",
          height: "80%",
          border: "1px solid red",
          position: "absolute",
          margin: "auto"
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100%",
            border: "1px solid black"
          }}
        >
          <div
            style={{
              width: "50%",
              height: "80%",
              border: "1px solid red",
              position: "absolute",
              margin: "auto",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0
            }}
          />
        </div>
      </div>
    </div>
  );
}
