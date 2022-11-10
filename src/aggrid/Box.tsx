import React, { FC, memo } from "react";
import { useDrag } from "react-dnd";
import { IWOData, stringToColour } from "./data";

interface IBoxProps {
  data: IWOData,
  hour: number;
  rowIndex: number;
  onDrop: (data: IWOData, start: number, end: number, rowIndex: number) => void
}

export const Box: FC<IBoxProps> = memo(function Box(props: IBoxProps) {
  console.log(props, "box props")
  const typeAccept = `${props.data.workorder}~${props.data.res}~${props.data.crew}`;
  const name = `${props.hour}`;
  const dragable: boolean = (props.data.start === props.hour) || (props.data.end === (props.hour + 1))
  const [{ isDragging }, drag] = useDrag(() => ({
    type: typeAccept,
    item: { name },
    end: (item: any, monitor) => {
      const dropResult = monitor.getDropResult<any>();
      if (item && dropResult) {
        console.log(item, dropResult)
        //alert(`You dropped ${item.name} into ${dropResult.name}!`);
        const oldHour = Number(item.name);
        const newHour = Number(dropResult.name)
        const change = newHour - oldHour;
        const newStart = Number(props.data.start!) + change;
        const newEnd = Number(props.data.end!) + change;
        props.onDrop(props.data, newStart, newEnd, props.rowIndex)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId()
    })
  }));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={drag}
      style={{
        width: "100%",
        backgroundColor: stringToColour(props.data.crew!),
        textAlign: "center",
        opacity
      }}
    >
      &nbsp;
    </div>
  );
})
