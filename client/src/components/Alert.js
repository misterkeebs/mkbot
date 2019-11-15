import React, { useState } from "react";
import { Alert } from 'reactstrap';

export default (props) => {
  const [visible, setVisible] = useState(true);

  const onDismiss = () => {
    props.onDismiss();
    setVisible(false);
  }

  return (
    <Alert color="info" isOpen={visible} toggle={onDismiss}>
      {props.message}
    </Alert>
  );
}
