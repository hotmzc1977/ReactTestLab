import React, { FC, memo } from "react";
import { useDrop } from "react-dnd";
import { IWOData } from "./data";

export interface IContainerProps {
  data: IWOData;
  hour: number;
  children?: JSX.Element;
}

export const Container: FC<IContainerProps> = memo(function Container(props: IContainerProps) {
  const start = props.data.start ?? 0
  const end = (props.data.end ?? 0) - 1

  const accept = `${props.data.workorder}~${props.data.res ?? ""}~${props.data.crew ?? ""}`;
  const dropName = `${props.hour}`;
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: accept,
    drop: () => ({ name: dropName }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop() && !props.children
    })
  }));

  const isActive = canDrop && isOver;
  let backgroundColor = "#FFF";
  if (isActive) {
    backgroundColor = "darkgreen";
  } else if (canDrop) {
    backgroundColor = "darkkhaki";
  }

  return (
    <div
      ref={drop}
      role={dropName}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        clear: "both",
        backgroundColor: backgroundColor
      }}
    >
      {props.children ?? null}
    </div>
  );
})
