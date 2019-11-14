import React, { useState } from 'react';
import { useAuth0 } from '../react-auth0-spa';

const Dashboard = () => {
  const [showResult, setShowResult] = useState(false);
  const [response, setResponse] = useState('');
  const { getTokenSilently } = useAuth0();

  const callApi = async () => {
    try {
      const token = await getTokenSilently();

      const response = await fetch('http://fcoury.pagekite.me/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const responseData = await response.json();

      setShowResult(true);
      setResponse(responseData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div>
        Dashboard
        <button onClick={callApi}>Ping API</button>
      </div>
      <hr/>
      <code>{JSON.stringify(response, null, 2)}</code>
    </>
  );
};

export default Dashboard;
