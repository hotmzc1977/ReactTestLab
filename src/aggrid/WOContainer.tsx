import { PromiseStatus } from "ag-grid/dist/lib/utils";
import React, { FC, memo } from "react";
import { useDrop } from "react-dnd";
import { IWOData, Resources, wodata } from "./data";

export default function WOContainer(props: any) {

    //console.log(props, "wocontainer")
    const rowData = props.data as IWOData;

    const acceptedResources = Resources.filter(r => {
        if (props.getResListOfWO(rowData.workorder).find((d: string) => d === r))
            return false;
        return true;
    })

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: acceptedResources,
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
            role={rowData.workorder}
            //className="cell-span-wo"
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                clear: "both",
                backgroundColor: backgroundColor
            }}
        >
            {rowData.workorder}
        </div>
    );
}
