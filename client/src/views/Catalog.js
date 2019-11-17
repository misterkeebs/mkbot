import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Row, Col,
  Nav, NavItem, NavLink,
  Badge,
} from 'reactstrap';

import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';

const getSculpts = async (maker_id) => {
  const response = await fetch(`/api/makers/${maker_id}/sculpts`);
  return response.json();
};

const getArtisans = async (maker_id, sculpt) => {
  const response = await fetch(`/api/makers/${maker_id}/artisans?sculpt=${sculpt}`);
  return response.json();
};

const Catalog = () => {
  const { slug } = useParams();
  const [sculptsLoading, setSculptsLoading] = useState(true);
  const [artisansLoading, setArtisansLoading] = useState(false);
  const [sculpts, setSculpts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const maker_id = slug.split('-')[0];

  useEffect(() => {
    setSculptsLoading(true);
    getSculpts(maker_id).then(sculpts => {
      console.log('sculpts', sculpts);
      setSculpts(sculpts);
      setSculptsLoading(false);
    })
  }, [maker_id]);

  const loadSculpt = async (sculpt) => {
    setArtisansLoading(true);
    const artisans = await getArtisans(maker_id, sculpt);
    console.log('artisans', artisans);
    setArtisans(artisans);
    setArtisansLoading(false);
  }

  const sculptsEl = sculptsLoading
    ? <DataLoading />
    : (
      <Nav vertical>
        {sculpts.map(s =>
          <NavItem key={s.sculpt}>
            <NavLink href="#" onClick={_ => loadSculpt(s.sculpt)}>
              {s.sculpt} <Badge color="info" pill>{s.count}</Badge>
            </NavLink>
          </NavItem>
        )}
      </Nav>
    );

  const artisansEl = artisansLoading
    ? <DataLoading />
    : <ArtisanList artisans={artisans} />;

  return (
    <Container>
      <Row>
        <Col xs="2">
          {sculptsEl}
        </Col>
        <Col xs="10">
          {artisansEl}
        </Col>
      </Row>
    </Container>
  );
};

export default Catalog;
