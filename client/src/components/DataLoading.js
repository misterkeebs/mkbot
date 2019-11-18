import React from "react";
import { Spinner } from 'reactstrap';

const DataLoading = (props) => (
  <div>
    <Spinner color="primary" {...props} />
  </div>
);

export default DataLoading;
