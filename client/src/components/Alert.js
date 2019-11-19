import React, { useState } from "react";
import { Alert } from 'reactstrap';

export default (props) => {
  const [visible, setVisible] = useState(true);

  const onDismiss = () => {
    props.onDismiss && props.onDismiss();
    setVisible(false);
  }

  return (
    <Alert color={props.type || 'info'} isOpen={visible} toggle={onDismiss}>
      {props.message}
    </Alert>
  );
}
