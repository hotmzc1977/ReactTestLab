import React, { useState } from 'react'
import { useDrag } from "react-dnd";
import { IWOData, stringToColour, Resources, Crews } from "./data";


function ResBox(props: { type: string, name: string, res?: string, insertNewRowData?: (item: any, target: any) => void, gridApi: any }) {

    const [{ isDragging }, drag] = useDrag(() => ({
        type: props.name,
        item: props,
        end: (item: any, monitor) => {
            const dropResult = monitor.getDropResult<any>()
            if (item && dropResult) {
                console.log(item, dropResult, props.gridApi, "resbox")
                props.insertNewRowData && props.insertNewRowData(item, dropResult)

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
                width: "100px",
                margin: "10px 10px",
                borderWidth: "1px",
                borderColor: stringToColour(props.name),
                borderStyle: "solid",
                textAlign: "center",
                opacity
            }}
        >
            {props.name}{props.res ? `/${props.res}` : null}
        </div>
    );
}

export default function ResList(props: { insertNewRowData: (item: any, target: any) => void, gridApi: any }) {
    const [resources, setResources] = useState<string[]>(Resources);

    return <div style={{ width: "100%", display: "flex", flexDirection: "row" }}>
        Resources:
        {
            resources.map(r => <ResBox key={r} type="res" name={r} insertNewRowData={props.insertNewRowData} gridApi={props.gridApi} />)
        }
    </div>
};


export function CrewList(props: { insertNewRowData: (item: any, target: any) => void, gridApi: any }) {


    return <div style={{ width: "100%", display: "flex", flexDirection: "row" }}>
        Crews:
        {
            Crews.map(r => <ResBox key={r.name} type="crew" name={r.name} res={r.res} insertNewRowData={props.insertNewRowData} gridApi={props.gridApi} />)
        }
    </div>
}


