import React from "react";
import { useParams } from 'react-router-dom';

import ArtisanList from "./ArtisanList";

const PublicList = () => {
  const { slug, listType } = useParams();
  console.log('slug, listType', slug, listType);
  const userId = slug.split('-')[0];
  return <ArtisanList
            listType={listType}
            userId={userId}
          />;
}

export default PublicList;
