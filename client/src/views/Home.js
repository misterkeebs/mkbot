import React, { Fragment } from 'react';
import { withRouter } from 'react-router'

import { useAuth0 } from "../react-auth0-spa";

import Hero from "../components/Hero";
import Content from "../components/Content";

const Home = (props) => {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    props.history.push('/dashboard');
    return <div></div>;
  }

  return (
    <Fragment>
      <Hero />
      <hr />
      <Content />
    </Fragment>
  );
}

export default withRouter(Home);
