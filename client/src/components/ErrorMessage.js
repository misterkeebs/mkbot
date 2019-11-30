import React from 'react';

import Alert from './Alert';

const ErrorMessage = props => {
  const { error } = props;

  const message = `There was an error loading this page: ${error.message}`;
  return <Alert type="danger" message={message} />;
};

export default ErrorMessage;
