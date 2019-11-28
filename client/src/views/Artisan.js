import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  Container, Row, Col, Button,
  Breadcrumb, BreadcrumbItem,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt, faListAlt, faHeart, faImage, faTimes
} from '@fortawesome/free-solid-svg-icons'

import { useAuth0 } from "../react-auth0-spa";
import DataLoading from '../components/DataLoading';
import getAuth from '../actions/getAuth';
import addArtisanToList from '../actions/addArtisanToList';
import removeArtisanFromList from '../actions/removeArtisanFromList';
import UploadForm from '../components/UploadForm';

const getArtisan = async (artisan_id) => {
  const response = await fetch(`/api/artisans/${artisan_id}`);
  return response.json();
};

const Artisan = props => {
  const { id } = useParams();
  const { isAuthenticated, getTokenSilently } = useAuth0();
  const artisan_id = id && parseInt(id.split('-')[0], 10);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [artisan, setArtisan] = useState(null);
  const [list, setList] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  const getUserList = getAuth(getTokenSilently, '/user/list');
  const getUserWishlist = getAuth(getTokenSilently, '/user/wishlist');

  useState(() => {
    const listPromise = isAuthenticated
      ? getUserList(getTokenSilently)
      : Promise.resolve({ artisans: [] });
    const wishlistPromise = isAuthenticated
      ? getUserWishlist(getTokenSilently)
      : Promise.resolve({ artisans: [] });
    Promise.all([
      listPromise,
      wishlistPromise,
      getArtisan(artisan_id),
    ]).then(([list, wishlist, artisan]) => {
      setList(list);
      setWishlist(wishlist);
      setArtisan(artisan);
      setLoading(false);
    });
  }, [id]);

  if (loading || !artisan) return <DataLoading />;

  const addTo = (list, name) => async _ => {
    const token = await getTokenSilently();
    setProcessing(name);
    await addArtisanToList(token, list, artisan.artisan_id);
    list.artisans.push({artisan_id: artisan.artisan_id});
    setProcessing(null);
  };

  const removeFrom = (list, name) => async _ => {
    const token = await getTokenSilently();
    setProcessing(name);
    await removeArtisanFromList(token, list, artisan.artisan_id);
    const idx = list.artisans.findIndex(a => a.artisan_id === artisan.artisan_id);
    list.artisans.splice(idx, 1);
    setProcessing(null);
  };

  const breadcrumbs = (
    <Row>
      <Col>
        <Breadcrumb>
          <BreadcrumbItem><NavLink to="/artisans">Artisans</NavLink></BreadcrumbItem>
          <BreadcrumbItem><NavLink to={`/catalogs/${artisan.maker_id}-${artisan.maker}`}>{artisan.maker}</NavLink></BreadcrumbItem>
          <BreadcrumbItem><NavLink to={`/catalogs/${artisan.maker_id}-${artisan.maker}/${artisan.sculpt}`}>{artisan.sculpt}</NavLink></BreadcrumbItem>
          <BreadcrumbItem>{artisan.colorway}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
  );

  const inList = list && list.artisans.find(a => a.artisan_id === artisan_id);
  const inWishlist = wishlist && wishlist.artisans.find(a => a.artisan_id === artisan_id);
  const actions = (
    <Row className="actions">
      <Col>
        {inList
          ? <Button color="danger" onClick={removeFrom(list, 'list')} disabled={processing === 'list'}>
              {processing === 'list'
                ? <DataLoading size="sm" />
                : <FontAwesomeIcon icon={faTrashAlt} color="white" />}{' '}
              Remove from My Artisans
            </Button>
          : <Button color="primary" onClick={addTo(list, 'list')} disabled={processing === 'list'}>
              {processing === 'list'
                ? <DataLoading size="sm" />
                : <FontAwesomeIcon icon={faListAlt} color="white" />}{' '}
              Add to My Artisans
            </Button>
        }
        {' '}
        {inWishlist
          ? <Button color="danger" onClick={removeFrom(wishlist, 'wishlist')} disabled={processing === 'list'}>
              {processing === 'wishlist'
                ? <DataLoading size="sm" />
                : <FontAwesomeIcon icon={faTrashAlt} color="white" />}{' '}
              Remove from Wishlist
            </Button>
          : <Button color="primary" onClick={addTo(wishlist, 'wishlist')} disabled={processing === 'list'}>
              {processing === 'wishlist'
                ? <DataLoading size="sm" />
                : <FontAwesomeIcon icon={faHeart} color="white" />}{' '}
              Add to Wishlist
            </Button>
        }
        {' '}
        <Button color="primary" onClick={_ => setUploadVisible(true)}>
          <FontAwesomeIcon icon={faImage} color="white" />{' '}
          Add Your Pic of This Sculpt
        </Button>
      </Col>
    </Row>
  );

  return (
    <Container className="mkb-artisan-page">
      {breadcrumbs}
      <Row className="title">
        <Col>
          <h1>{artisan.sculpt} {artisan.colorway}</h1>
          <div className="maker">
            by <NavLink to={artisan.makerLink}>{artisan.maker}</NavLink>
          </div>
        </Col>
      </Row>
      {!uploadVisible && <Row className="image">
        <Col>
          <img
            alt={`${artisan.sculpt} ${artisan.colorway}`}
            src={artisan.image}
          />
        </Col>
      </Row>}
      {uploadVisible &&
        <UploadForm
          onCancel={_ => setUploadVisible(false)}
        />}
      {isAuthenticated && !uploadVisible && actions}
    </Container>
  )
};

export default Artisan;
