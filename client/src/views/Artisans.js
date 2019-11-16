import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col,
  Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button
} from 'reactstrap';
import _ from 'lodash';

import { useAuth0 } from '../react-auth0-spa';

import DataLoading from "../components/DataLoading";

function formatName(data) {
  const colorway = data.colorway ? ` ${data.colorway}` : '';
  return `${data.sculpt}${colorway}`;
}

const getArtisans = async (getTokenSilently) => {
  const token = await getTokenSilently();
  const response = await fetch('/api/user/artisans', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.json();
};

const Artisans = (props) => {
  const { getTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState([]);

  useEffect(() => {
    getArtisans(getTokenSilently).then(list => {
      console.log('list', list);
      setArtisans(list);
      setLoading(false);
    });
  }, [getTokenSilently]);

  if (loading) {
    return <DataLoading />;
  }

  const cards = artisans.map(a => {
    return (
      <Col>
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

  const rows = _.chunk(cards, 4).map(group => <Row>{group}</Row>);

  return (
    <Container>
      {rows}
    </Container>
  );
};

export default Artisans;
