import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth0 } from '../react-auth0-spa';
import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';

const getArtisans = async (getTokenSilently, maker_id) => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/makers/${maker_id}/artisans`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

const Catalog = () => {
  const { getTokenSilently } = useAuth0();
  const { slug } = useParams();
  console.log('slug', slug);
  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState([]);
  const maker_id = slug.split('-')[0];
  console.log('maker_id', maker_id);

  useEffect(() => {
    setLoading(true);
    getArtisans(getTokenSilently, maker_id).then(artisans => {
      setLoading(false);
      setArtisans(artisans);
    })
  }, [getTokenSilently, maker_id]);

  if (loading) {
    return <DataLoading />;
  }

  return (
    <ArtisanList
      artisans={artisans}
   />
  );
};

export default Catalog;
