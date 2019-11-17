import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { useAuth0 } from '../react-auth0-spa';

import DataLoading from '../components/DataLoading';
import ArtisanListCmp from '../components/ArtisanList';

const getArtisans = async (getTokenSilently, listType) => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/user/${listType}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

const removeArtisan = async (token, listType, artisan_id) => {
  const response = await fetch(`/api/lists/${listType}/${artisan_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

const ArtisanList = (props) => {
  const { listType } = props;
  const { getTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState([]);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    getArtisans(getTokenSilently, listType).then(list => {
      setArtisans(list);
      setLoading(false);
    });
  }, [getTokenSilently, listType]);

  const remove = async artisan => {
    setProcessing(artisan.artisan_id);
    const token = await getTokenSilently();
    await removeArtisan(token, listType, artisan.artisan_id);
    const toRemove = artisans.indexOf(artisan);
    const newArtisans = _.clone(artisans);
    newArtisans.splice(toRemove, 1);
    setArtisans(newArtisans);
    setProcessing(null);
  };

  if (loading) {
    return <DataLoading />;
  }

  if (!artisans) {
    return <div>No Artisans</div>;
  }

  return <ArtisanListCmp
    artisans={artisans}
    onRemove={remove}
    processing={processing}
  />;
};

export default ArtisanList;
