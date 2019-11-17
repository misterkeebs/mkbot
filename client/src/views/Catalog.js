import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';

const getArtisans = async (maker_id) => {
  const response = await fetch(`/api/makers/${maker_id}/artisans`);
  return response.json();
};

const Catalog = () => {
  const { slug } = useParams();
  console.log('slug', slug);
  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState([]);
  const maker_id = slug.split('-')[0];
  console.log('maker_id', maker_id);

  useEffect(() => {
    setLoading(true);
    getArtisans(maker_id).then(artisans => {
      setLoading(false);
      setArtisans(artisans);
    })
  }, [maker_id]);

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
