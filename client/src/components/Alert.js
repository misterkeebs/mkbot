import React, { useState } from "react";
import { Alert } from 'reactstrap';

export default (props) => {
  const [visible, setVisible] = useState(true);

  const onDismiss = () => {
    setVisible(false);
    if (props.onDismiss) {
      setVisible(props.onDismiss());
    }
  }

  return (
    <Alert color={props.type || 'info'} isOpen={visible} toggle={onDismiss}>
      {props.message}
    </Alert>
  );
}
