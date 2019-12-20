import React from "react";
import { Button } from 'reactstrap';

const Hero = () => {
  const redirectToBot = () => {
    const url = 'https://discordapp.com/api/oauth2/authorize?client_id=640908207325446144&permissions=392256&scope=bot';
    window.location.href = url;
  };

  return (
    <div className="text-center hero my-3">
      <h2 className="mb-4">MKBot Artisan Discord Bot</h2>

      <p className="lead">
        Manage and share your artisan collection and the ones you're
        looking for using a community driven database. All in one place!

        <div style={{marginTop: 20}}>
          <Button
            color="success"
            onClick={redirectToBot}
          >
            Add MKBot to Your Server
          </Button>
        </div>
      </p>
    </div>
  );
};

export default Hero;
