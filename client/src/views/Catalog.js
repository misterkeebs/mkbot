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

const getArtisans = async (maker_id, sculpt, page=1) => {
  const response = await fetch(`/api/makers/${maker_id}/artisans?sculpt=${sculpt}&page=${page}`);
  const artisans = await response.json();
  const headers = response.headers;
  return {
    artisans,
    page: headers.get('X-Pagination-Page'),
    pages: headers.get('X-Pagination-TotalPages'),
    pageSize: headers.get('X-Pagination-PerPage'),
  };
};

const Catalog = () => {
  const { slug } = useParams();
  const [sculptsLoading, setSculptsLoading] = useState(true);
  const [artisansLoading, setArtisansLoading] = useState(false);
  const [sculpts, setSculpts] = useState([]);
  const [sculpt, setSculpt] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [page, setPage] = useState(null);
  const [pages, setPages] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const maker_id = slug.split('-')[0];

  useEffect(() => {
    setSculptsLoading(true);
    getSculpts(maker_id).then(sculpts => {
      console.log('sculpts', sculpts);
      setSculpts(sculpts);
      setSculptsLoading(false);
    })
  }, [maker_id]);

  const loadSculpt = async (sculpt, page=1) => {
    setArtisansLoading(true);
    const { artisans, pages, pageSize } = await getArtisans(maker_id, sculpt, page);
    console.log('artisans', { artisans, page, pages });
    setSculpt(sculpt);
    setArtisans(artisans);
    setPage(page);
    setPages(pages);
    setPageSize(pageSize);
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

  const onPageChange = (newPage) => {
    loadSculpt(sculpt, newPage);
  };

  const artisansEl = artisansLoading
    ? <DataLoading />
    : <ArtisanList
        artisans={artisans}
        pages={pages}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />;

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
