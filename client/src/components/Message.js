import React from "react";
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'query-string';

import Alert from './Alert';

export default (props) => {
  const location = useLocation();
  const history = useHistory();

  const { msg } = qs.parse(window.location.search);

  const onDismiss = () => {
    location.search = '';
    history.push(location);
  };

  return msg ? (
    <Alert color="info" message={msg} onDismiss={onDismiss} />
  ) : null;
}
