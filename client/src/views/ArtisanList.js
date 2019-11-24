import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container, Row, Col,
} from 'reactstrap';
import _ from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons'

import { useAuth0 } from '../react-auth0-spa';

import getUser from '../actions/getUser';
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
  const history = useHistory();
  const useAuth = useAuth0();
  let authLoading = false;
  let user, getTokenSilently;

  if (!userId) {
    authLoading = useAuth.loading;
    user = useAuth.user;
    getTokenSilently = useAuth.getTokenSilently;
  }

  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState([]);
  const [list, setList] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    let result;
    if (userId) {
      result = getUserArtisans(userId, listType);
    } else {
      result = getArtisans(getTokenSilently, listType);
    }
    const promises = [result];
    if (!userId) {
      promises.push(getUser(getTokenSilently));
    } else {
      promises.push(Promise.resolve());
    }

    Promise.all(promises).then(([{ list, artisans }, dbUser]) => {
      if (userId && !list) {
        history.push('/artisans?msg=List+not+found');
      }
      setList(list);
      setArtisans(artisans);
      setDbUser(dbUser);
      setLoading(false);
    });
  }, [getTokenSilently, listType, userId, history]);

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
    setToggling(true);
    const setPublic = !list.public;
    const newList = await updateList(getTokenSilently, listType, setPublic);
    setList(newList);
    setToggling(false);
  };

  const handleCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 800);
  };

  const nickname = user && (dbUser.nickname || user.nickname);
  const url = user && `${list.url_prefix}/${list.user_id}-${nickname}/${listType}`;
  let listText = null;
  if (user) {
    if (toggling) {
      listText = <DataLoading size="sm" />;
    } else {
      listText = list.public
        ? <CopyToClipboard text={url} onCopy={handleCopied}>
            <div>
              This artisan list is currently public
              at <a href={url}>{url}</a> <FontAwesomeIcon icon={faCopy} color="#ccc" />
              <span className="mkb-list-action-copied">{copied && ' copied!'}</span>
            </div>
          </CopyToClipboard>
        : <div>This artisan list is currently private.</div>;
    }
  };
  const listAction = list.public ? 'Make Private' : 'Make Public';

  const listInfo = user && (
    <Row className="mkb-list">
      <Col xs={8}>
        {listText}
      </Col>
      <Col xs={4} className="mkb-list-action">
        {toggling
          ? listAction
          : <a href="#noop" onClick={toggleVisibility} disabled={toggling}>
            {listAction}</a>}
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
            perRow={props.perRow}
          />
        </Col>
      </Row>
    </Container>
  )
};

export default ArtisanList;
