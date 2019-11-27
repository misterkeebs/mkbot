import React from "react";

import { useAuth0 } from '../react-auth0-spa';
import ArtisanList from "./ArtisanList";

const MyArtisans = () => {
  const { user, getTokenSilently, isAuthenticated } = useAuth0();
  return <ArtisanList
    user={user}
    getTokenSilently={getTokenSilently}
    isAuthenticated={isAuthenticated}
    listType="list"
    perRow={4}
  />;
}

export default MyArtisans;
