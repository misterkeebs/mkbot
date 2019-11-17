import React, { Fragment } from 'react';

import Hero from "../components/Hero";
import Content from "../components/Content";

const Bot = (props) => {
  return (
    <Fragment>
      <Hero />
      <hr />
      <Content />
    </Fragment>
  );
}

export default Bot;
