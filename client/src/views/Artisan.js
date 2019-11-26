import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Row, Col, Button,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt, faTimes, faCheck, faListAlt, faHeart,
} from '@fortawesome/free-solid-svg-icons'

import DataLoading from '../components/DataLoading';

const getArtisan = async (artisan_id) => {
  const response = await fetch(`/api/artisans/${artisan_id}`);
  return response.json();
};

const Artisan = props => {
  const { id } = useParams();
  const artisan_id = id && id.split('-')[0];
  const [loading, setLoading] = useState(false);
  const [artisan, setArtisan] = useState(null);

  useState(() => {
    getArtisan(artisan_id).then(artisan => {
      setArtisan(artisan);
      setLoading(false);
    });
  }, [id]);

  if (loading || !artisan) return <DataLoading />;

  return (
    <Container className="mkb-artisan-page">
      <Row className="title">
        <Col>
          <h1>{artisan.sculpt} {artisan.colorway}</h1>
        </Col>
      </Row>
      <Row className="image">
        <Col>
          <img
            alt={`${artisan.sculpt} ${artisan.colorway}`}
            src={artisan.image}
          />
        </Col>
      </Row>
      <Row className="actions">
        <Col>
          <Button color="primary">
            <FontAwesomeIcon icon={faListAlt} color="white" />{' '}
            Add to My Artisans
          </Button>
          {' '}
          <Button color="primary">
            <FontAwesomeIcon icon={faHeart} color="white" />{' '}
            Add to Wishlist
          </Button>
        </Col>
      </Row>
    </Container>
  )
};

export default Artisan;
