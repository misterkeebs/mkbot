import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col,
  Card, CardImg, CardBody, CardTitle, CardSubtitle,
} from 'reactstrap';
import _ from 'lodash';

import { useAuth0 } from '../react-auth0-spa';

import DataLoading from "./DataLoading";

function formatName(data) {
  const colorway = data.colorway ? ` ${data.colorway}` : '';
  return `${data.sculpt}${colorway}`;
}

const getArtisans = async (getTokenSilently, listType) => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/user/${listType}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.json();
};

const ArtisanList = (props) => {
  const { getTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState([]);

  useEffect(() => {
    getArtisans(getTokenSilently, props.listType).then(list => {
      setArtisans(list);
      setLoading(false);
    });
  }, [getTokenSilently, props.listType]);

  if (loading) {
    return <DataLoading />;
  }

  if (!artisans) {
    return <div>No Artisans</div>;
  }

  const cards = artisans.map(a => {
    return (
      <Col key={a.artisan_id}>
        <Card>
          <CardImg top width="20%" src={a.image} alt={a.sculpt} />
          <CardBody>
            <CardTitle><b>{formatName(a)} </b></CardTitle>
            <CardSubtitle>{a.maker}</CardSubtitle>
          </CardBody>
        </Card>
      </Col>
    );
  });

  const rows = _.chunk(cards, 4).map((group, i) => <Row key={`row_${i}`}>{group}</Row>);

  return (
    <Container>
      {rows}
    </Container>
  );
};

export default ArtisanList;
