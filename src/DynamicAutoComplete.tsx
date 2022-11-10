import React, { useState } from "react";

import { countries, countryToFlag, CountryType } from "./data/Countries";
import { Autocomplete, TextField, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
  option: {
    fontSize: 15,
    "& > span": {
      marginRight: 10,
      fontSize: 18
    }
  }
});

export default function DynamicAutoComplete() {
  const classes = useStyles();
  const history = useHistory()
  const [value, setValue] = useState("");

  const getList = (filter: any): CountryType[] => {
    return [];
    // return (filter === ""
    //   ? countries.slice(0, 10)
    //   : countries
    //       .filter(
    //         (c) =>
    //           c.code.toLowerCase().includes(filter.toLowerCase()) ||
    //           c.label.toLowerCase().includes(filter.toLowerCase()) ||
    //           c.phone.includes(filter)
    //       )
    //       .slice(0, 10)) as CountryType[];
  };
  console.log(history.location)
  return (
    <Autocomplete
      id="country-select-demo"
      style={{ width: 300 }}
      options={getList(value)}
      classes={{
        option: classes.option
      }}
      autoHighlight
      getOptionLabel={(option: any) => option.label}

      onChange={(event, newValue) => {
        console.log(newValue);
        if (!newValue) {
          setValue("");
        } else {
          if (typeof newValue === "string") {
            setValue(newValue);
          } else {
            setValue((newValue as CountryType).code);
          }
        }
      }}
      renderOption={(option: any) => (
        <React.Fragment>
          <span>{countryToFlag(option.code)}</span>
          {option.label} ({option.code}) +{option.phone}
        </React.Fragment>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          onChange={(e) => setValue(e.target.value)}
          label="Choose a country"
          variant="outlined"
          inputProps={{
            ...params.inputProps
          }}
        />
      )}
    />
  );
}
