import { TextareaAutosize } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";


const useStyles = makeStyles({
  inputarea: {
    width: "100%",
    maxHeight: "calc(100vh - 200px)"
  }
});

export default function PreviewTextBefUpload() {
  const classes = useStyles();
  const [file, setFile] = useState<string>();

  function readFileContent(file: Blob) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event: any) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file, "UTF-8");
    });
  }

  const handleChange = async (e: any) => {
    if (e.target.files.length > 0) {
      try {
        const content: any = await readFileContent(e.target.files[0]);
        setFile(content.toString());
      } catch (err) {
        setFile("Error reading file.");
      }
    } else {
      setFile("");
    }
  };
  return (
    <div>
      <input
        type="file"
        onChange={handleChange}
        accept="application/json,text/plain"
      />
      <br />

      <TextareaAutosize
        maxRows={50}
        className={classes.inputarea}
        value={file}
      />
    </div>
  );
}
