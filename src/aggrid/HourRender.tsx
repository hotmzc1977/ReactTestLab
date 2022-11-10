import React, { FC, memo } from "react";
import { Box } from "./Box";
import { Container } from "./Container";
import { IWOData } from "./data";


interface IHourRenderProps {
  hour: number,
  updateCrewStartEnd: (data: IWOData, start: number, end: number, rowIndex: number) => void,
  rowIndex: number;
  data: IWOData;
}


export const HourRender: FC<IHourRenderProps> = memo(function HourRender(props: IHourRenderProps) {
  //console.log(props, "HourRender");
  const hour = props.hour;
  const { start, end, workorder, res, crew } = props.data;
  const key = `${props.data.workorder}~${props.data.res ?? ""}~${props.data.crew ?? ""}~${hour}`;

  return hour >= (start ?? 0) && hour < (end ?? 0) ? (
    <Container key={`C~${key}`} data={props.data} hour={hour}>
      <Box key={`B~${key}`} data={props.data} hour={hour} onDrop={props.updateCrewStartEnd} rowIndex={props.rowIndex} />
    </Container>
  ) : (
    <Container key={`C~${key}`} data={props.data} hour={hour} />
  );
})
