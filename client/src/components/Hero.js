import React from "react";

import logo from "../assets/logo.png";
import demo from "../assets/demo.gif";

const Hero = () => (
  <div className="text-center hero my-3">
    <img className="mb-3 app-logo" src={logo} alt="React logo" width="120" />
    <h1 className="mb-4">MKBot Artisan Discord Bot</h1>

    <p>
      <img src={demo} width="400"/>
    </p>

    <p className="lead">
      Allows Discord users to research makers, sculpts, colorways and
      curate the artisans they own and the ones they are looking for.
    </p>
  </div>
);

export default Hero;
