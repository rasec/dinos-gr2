import React from 'react';
import T from 'prop-types';
import { TextField } from '@material-ui/core';

const initialDate = "2021-09-20";

function FilterForm({ setInitalDate, setEndDate }) {
  return (
    <>
      <TextField
        id="date"
        label="Start Date"
        type="date"
        defaultValue={initialDate}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={e => setInitalDate(e.target.value)}
      />
      <TextField
        id="date"
        label="End Date"
        type="date"
        InputLabelProps={{
          shrink: true,
        }}
        onChange={e => setEndDate(e.target.value)}
      />
    </>
  );
};

FilterForm.propTypes = {
  setEndDate: T.func,
  setInitalDate: T.func
};

export default FilterForm;