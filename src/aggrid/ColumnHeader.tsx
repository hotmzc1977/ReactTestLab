import React from 'react'


export default function ColumnHeader(props: any) {
    //console.log(props, "ColumnHeader")
    return <div style={{ height: "100%", width: "100%", display: "flex", justifyContent: "flex-end", alignItems: 'center', fontSize: "10px" }}>
        {props.displayName}
    </div>
}