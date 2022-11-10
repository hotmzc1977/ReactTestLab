import { PromiseStatus } from "ag-grid/dist/lib/utils";
import React, { FC, memo } from "react";
import { useDrop } from "react-dnd";
import { Crews, IWOData, Resources, wodata } from "./data";

export default function ResContainer(props: any) {

    const rowData = props.data as IWOData;
    const { res, workorder } = rowData;
    const crewsAssigned = props.getCrewListOfWORes(workorder, res)
    const acceptedCrews = Crews.filter(c => !res || (c.res === res && !crewsAssigned.find((ca: string) => ca === c.name)))
    // if (!res) {
    //     console.log(rowData, crewsAssigned, acceptedCrews, "rescontainer")
    // }

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: acceptedCrews.map(c => c.name),
        drop: () => ({ ...rowData, rowIndex: props.rowIndex }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
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
            role={rowData.res ?? ""}
            className="cell-span-wo"
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                clear: "both",
                backgroundColor: backgroundColor
            }}
        >
            {rowData.res ?? "n/a"}
        </div>
    );
}
