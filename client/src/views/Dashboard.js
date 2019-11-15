import React, { useState, useEffect } from 'react';

import { useAuth0 } from '../react-auth0-spa';

const getUser = async (getTokenSilently) => {
  const token = await getTokenSilently();
  const response = await fetch('/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.json();
};

const Dashboard = () => {
  const { getTokenSilently } = useAuth0();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser(getTokenSilently).then(user => {
      setUser(user);
      setLoading(false);
    });
  }, [getTokenSilently]);

  if (loading) {
    return 'Loading';
  }

  if (user.discord_user_id) {
    return <div>You're all set</div>;
  }

  return <div>In order to get started you need to link you Discord account</div>;
};

export default Dashboard;
