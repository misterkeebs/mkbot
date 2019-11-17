import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col,
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import slugify from 'slugify';

import DataLoading from '../components/DataLoading';

const getMakers = async () => {
  const response = await fetch(`/api/makers`);
  return response.json();
};

const Catalogs = () => {
  const [loading, setLoading] = useState(true);
  const [makers, setMakers] = useState([]);

  useEffect(() => {
    setLoading(true);
    getMakers().then(makers => {
      setLoading(false);
      setMakers(makers)
    })
  }, []);

  if (loading) {
    return <DataLoading />;
  }

  const maker = (maker) => {
    return (
      <Row key={maker.maker_id}>
        <Col>
          <NavLink to={`/catalogs/${maker.maker_id}-${slugify(maker.name)}`}>
            {maker.name}
          </NavLink>
        </Col>
      </Row>
    );
  }

  return (
    <Container className="mkb-makers">
      {makers.map(maker)}
    </Container>
  );
};

export default Catalogs;
