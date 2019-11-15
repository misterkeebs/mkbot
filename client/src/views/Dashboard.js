import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router'

import DataLoading from "../components/DataLoading";
import Alert from "../components/Alert";
import { useAuth0 } from '../react-auth0-spa';
import qs from 'query-string';

const getUser = async (getTokenSilently) => {
  const token = await getTokenSilently();
  const response = await fetch('/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.json();
};

const Dashboard = (props) => {
  const { getTokenSilently } = useAuth0();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const { msg } = qs.parse(window.location.search);

  useEffect(() => {
    getUser(getTokenSilently).then(user => {
      setUser(user);
      setLoading(false);
    });
  }, [getTokenSilently]);

  if (loading) {
    return <DataLoading />;
  }

  let message = 'In order to get started you need to link you Discord account';
  if (user.discord_user_id) {
    message = `You're all set`;
  }

  const onDismiss = () => {
    const { location, history } = props;
    location.search = '';
    history.push(location);
  };

  const alert = msg && (
    <Alert message={msg} onDismiss={onDismiss} />
  );

  return (
    <>
      {alert}
      <div>{message}</div>
    </>
  );
};

export default withRouter(Dashboard);
