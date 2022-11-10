import React, { useEffect, useRef, useState } from "react";
import { AgGridColumn, AgGridReact } from "@ag-grid-community/react";
import { AllCommunityModules, FilterChangedEvent, GridApi, GridReadyEvent } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";
import "./style.css";
import { wodata, IWOData } from "./data";
import { HourRender } from "./HourRender";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import ColumnHeader from "./ColumnHeader";
import { isNumber } from "util";
import HourEditor from "./HourEditor";
import ResList, { CrewList } from "./ResList";
import WOContainer from "./WOContainer";
import ResContainer from "./ResContainer";
import { RowGroupingDisplayType } from "ag-grid-community";

export default function TheGrid() {

  const gridApi = useRef<any>(null);
  const gridColumnApi = useRef<any>(null);
  const [rowData, setRowData] = useState<IWOData[]>([]);
  const [timeLine, setTimeLIne] = useState<number[]>([]);
  const [moveStyle, setMoveStyle] = useState<number>(0);
  console.log(gridApi, "gridApi")

  const onGridReady = (params: GridReadyEvent) => {
    console.log("onGridReady")
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    // setGridApi(params.api);
    // setGridColumnApi(params.columnApi);
    setRowData(wodata);
    params.api.setRowData(wodata);
  };

  function woSpan(params: any) {
    //console.log(params);
    return params.data.woSpan ?? 1;
  }

  function resSpan(params: any) {
    //console.log(params);
    return params.data.resSpan ?? 1;
  }

  useEffect(() => {
    console.log("start rendering")

    const tl = [];
    for (var i = 0; i < 24; i++) {
      tl.push(i);
    }
    setTimeLIne(tl);
  }, []);

  const getResListOfWO = (workorder: string) => {
    const ress: string[] = [];
    gridApi.current.forEachNode(function (node: any) {
      if (node.data.workorder === workorder && node.data.res) {
        ress.push(node.data.res)
      }
    });
    return ress;
  }

  const getCrewListOfWORes = (workorder: string, res: string) => {
    const crews: string[] = [];
    gridApi.current.forEachNode(function (node: any) {
      if (node.data.workorder === workorder && node.data.res === res && node.data.crew) {
        crews.push(node.data.crew)
      }
    });
    return crews;
  }


  const updateCrewStartEnd = (data: IWOData, start: number, end: number, rowIndex: number) => {
    if (start < 0 || end > 24) return;
    if (gridApi.current) {
      let selectedRows = gridApi.current.getSelectedRows();
      let newStart = start;
      let newEnd = end;
      //extend
      if (moveStyle === 1) {
        const change = start - data.start!
        if (change > 0) {
          newStart = data.start!;
          newEnd = data.end! + change
        }
        else {
          newStart = data.start! + change
          newEnd = data.end!;
        }
      }

      //setRowData(datas);
      const rowNode = gridApi.current.getRowNode(rowIndex);
      console.log(rowNode, "rowNode")
      rowNode.setData({ ...data, start: newStart, end: newEnd })
    }

  };

  const handleMoveStyleChange = () => {
    setMoveStyle(1 - moveStyle)
  }

  function numberValueParser(params: any) {
    if (typeof (params.newValue) === "number")
      return Number(params.newValue);
    return 0;
  }

  const insertNewRowData = (item: any, target: any) => {
    console.log(target, item, gridApi, "insertNewRowData")
    if (gridApi.current) {
      const rowIndex = Number(target.rowIndex);
      const workorder = target.workorder
      if (item.type === "crew") {
        const crew = item.name;
        const res = item.res

        if (target.res && target.crew) {
          gridApi.current.applyTransaction({ addIndex: rowIndex + 1, add: [{ workorder, crew, res }] })

        }
        else {
          const rowNode = gridApi.current.getDisplayedRowAtIndex(rowIndex);
          rowNode.setData({ workorder, res, crew })


        }
      }
      else if (item.type === "res") {
        const res = item.name
        if (target.res) {
          gridApi.current.applyTransaction({ addIndex: rowIndex + 1, add: [{ workorder, res }] })

        }
        else {
          const rowNode = gridApi.current.getDisplayedRowAtIndex(rowIndex);
          rowNode.setData({ workorder, res })
        }
      }
      gridApi.current.redrawRows();
    }
  }

  const onFilterChanged = (event: FilterChangedEvent) => {
    gridApi.current.redrawRows();
  }

  return (
    <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
      {/* <FormControl component="fieldset">
        <FormLabel component="legend">Moving Style</FormLabel>
        <RadioGroup aria-label="style" name="movestyle" value={moveStyle} onChange={handleMoveStyleChange}>
          <FormControlLabel value={0} control={<Radio color="primary" />} label="Move" />
          <FormControlLabel value={1} control={<Radio color="primary" />} label="Expand" />
        </RadioGroup>
      </FormControl> */}
      <AgGridReact
        defaultColDef={{
          flex: 1,
          minWidth: 100,
          sortable: true,
          resizable: true,
        }}
        autoGroupColumnDef={{ minWidth: 200 }}
        groupDisplayType={RowGroupingDisplayType.SINGLE_COLUMN}
        animateRows={true}
        onGridReady={onGridReady}
        rowData={rowData}
      >
        <AgGridColumn
          field="workorder"
          rowGroup={true}
        // rowSpan={woSpan}
        // cellClassRules={{
        //   "cell-span-wo": "true"
        // }}
        // cellRenderer="woContainer"
        // cellRendererParams={{ getResListOfWO: getResListOfWO }}


        />

        <AgGridColumn
          field="res"
        // rowSpan={resSpan}
        // cellClassRules={{
        //   "cell-span-res": "true"
        // }}
        // cellRenderer="resContainer"
        // cellRendererParams={{ getCrewListOfWORes: getCrewListOfWORes }}
        />
        <AgGridColumn field="crew" />
        <AgGridColumn field="start" maxWidth={80} editable={true} cellEditor="hourEditor" valueParser={numberValueParser} />
        <AgGridColumn field="end" maxWidth={80} editable={true} cellEditor="hourEditor" valueParser={numberValueParser} />


        {/* {timeLine.map((tl) => (
          <AgGridColumn
            headerComponent="headerRender"

            key={tl}
            headerName={(tl + 1).toString()}
            maxWidth={30}
            cellRenderer="hourRender"
            cellRendererParams={{ hour: tl, updateCrewStartEnd }}
          />
        ))} */}


      </AgGridReact>
      <ResList insertNewRowData={insertNewRowData} gridApi={gridApi} />

      <CrewList insertNewRowData={insertNewRowData} gridApi={gridApi} />

    </div>
  );
}
