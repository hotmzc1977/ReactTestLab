import React, { useState } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

export default function PreviewImgBefUpload() {
  const [file, setFile] = useState<string>("");
  const [file2, setFile2] = useState<any>();
  const [allContent, setAllContent] = useState<string>("");
  const [text, setText] = useState("")

  const toBase64 = async (file: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const toText = async (file: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = () => {
      const result = reader.result as string;
      if (result.match(/[^\u0000-\u007f]/)) {
        resolve("")
      } else {
        resolve(result)
      }
    };
    reader.onerror = error => reject(error);
  });

  const handleChange = async (e: any) => {
    console.log(e.target.files);
    if (e.target.files.length > 0) {
      const content = await toBase64(e.target.files[0]);
      const text = await toText(e.target.files[0])
      setText(text as string)
      setFile(URL.createObjectURL(e.target.files[0]))

      setAllContent(content as any as string)
    }
    else {
      setFile("");
      setAllContent("")
    }
  }

  return (
    <div>
      <input type="file" onChange={handleChange} accept="*" />
      <br />
      {file && <img
        src={file}
        alt="preview"
        style={{
          height: "50px",
          width: "50px",
          border: "solid",
          borderWidth: "1px",
          borderColor: "red"
        }}
      />}

      {allContent && <img
        src={allContent}
        alt="preview"
        style={{
          height: "50px",
          width: "50px",
          border: "solid",
          borderWidth: "1px",
          borderColor: "red"
        }}
      />}

      {
        text && <p>{text}</p>
      }
    </div>
  );
}
