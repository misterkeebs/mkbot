import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col,
  ListGroup, ListGroupItem,
  Button,
} from 'reactstrap';
import _ from 'lodash';

import { useAuth0 } from '../react-auth0-spa';

import Loading from '../components/Loading';
import DataLoading from '../components/DataLoading';
import ArtisanListCmp from '../components/ArtisanList';

const getArtisans = async (getTokenSilently, listType) => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/user/${listType}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

const getUserArtisans = async (userId, listType) => {
  const response = await fetch(`/api/users/${userId}/${listType}`);
  return response.json();
};

const updateList = async (getTokenSilently, listType, setPublic) => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/user/${listType}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public: setPublic }),
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
  const { listType, userId } = props;
  const useAuth = useAuth0();
  let authLoading = false;
  let user, getTokenSilently;

  if (userId) {
    authLoading = useAuth.loading;
    user = useAuth.user;
    getTokenSilently = useAuth.getTokenSilently;
  }

  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState([]);
  const [list, setList] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    let result;
    if (userId) {
      result = getUserArtisans(userId, listType);
    } else {
      result = getArtisans(getTokenSilently, listType);
    }

    result.then(({ list, artisans }) => {
      console.log('list, artisans', list, artisans);
      setList(list);
      setArtisans(artisans);
      setLoading(false);
    });
  }, [getTokenSilently, listType, userId]);

  if (authLoading || (!user && !userId)) {
    return <Loading />;
  }

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

  const toggleVisibility = async () => {
    const setPublic = !list.public;
    const newList = await updateList(getTokenSilently, listType, setPublic);
    setList(newList);
  };

  const url = user && `${list.url_prefix}/${list.user_id}-${user.nickname}/${listType}`;
  const listInfo = user && (
    <Row>
      <Col>
        <ListGroup className="mkb-list-message">
          <ListGroupItem>
            <div className="mkb-list-action">
              <Button onClick={toggleVisibility}>
                {list.public
                  ? 'Make Private'
                  : 'Make Public'
                }
              </Button>
            </div>
            <div className="mkb-list-text">
              {list.public
                ? `This artisan list is public at ${url}`
                : 'This artisan list is private.'
              }
            </div>
          </ListGroupItem>
        </ListGroup>
      </Col>
    </Row>
  );

  return (
    <Container>
      {listInfo}
      <Row>
        <Col>
          <ArtisanListCmp
            artisans={artisans}
            onRemove={remove}
            processing={processing}
          />
        </Col>
      </Row>
    </Container>
  )
};

export default ArtisanList;
