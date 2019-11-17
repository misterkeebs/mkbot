import React from "react";
import { withRouter } from 'react-router'

// import { useAuth0 } from "../react-auth0-spa";

const Home = (props) => {
  // const { isAuthenticated } = useAuth0();

  props.history.push('/artisans');

  return (
    <div>Home</div>
  );
};

export default withRouter(Home);
