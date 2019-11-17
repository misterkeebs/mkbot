import React from "react";
import { withRouter } from 'react-router'

import { useAuth0 } from "../react-auth0-spa";

const Home = (props) => {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    props.history.push('/dashboard');
    return <div></div>;
  }

  return (
    <div>Home</div>
  );
};

export default withRouter(Home);
