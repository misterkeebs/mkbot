import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, useParams, useHistory } from 'react-router-dom';
import {
  Container, Row, Col,
  Nav, NavItem, NavLink,
  Breadcrumb, BreadcrumbItem,
  Badge,
} from 'reactstrap';

import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';
import preventUnlessNewTab from '../utils/preventUnlessNewTab';

const getSculpts = async (maker_id) => {
  const response = await fetch(`/api/makers/${maker_id}/sculpts`);
  return response.json();
};

const getArtisans = async (maker_id, sculpt, page=1) => {
  const sculptTerm = `sculpt=${sculpt.replace('&', '%26')}`;
  const response = await fetch(`/api/makers/${maker_id}/artisans?${sculptTerm}&page=${page}`);
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
  const history = useHistory();
  const { slug, sculpt: initialSculpt } = useParams();
  const [sculptsLoading, setSculptsLoading] = useState(true);
  const [artisansLoading, setArtisansLoading] = useState(false);
  const [sculpts, setSculpts] = useState([]);
  const [sculpt, setSculpt] = useState(initialSculpt);
  const [artisans, setArtisans] = useState([]);
  const [page, setPage] = useState(null);
  const [pages, setPages] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const maker_id = slug.split('-')[0];
  const maker = slug.split('-')[1];

  useEffect(() => {
    if (sculpt) {
      loadSculpt(sculpt);
    }

    if (!sculpt || sculpts.length < 1) {
      setSculptsLoading(true);
      getSculpts(maker_id).then(sculpts => {
        setSculpts(sculpts);
        setSculptsLoading(false);
      });
    }
  // eslint-disable-next-line
  }, [maker_id, sculpt]);

  const loadSculpt = async (sculpt, page=1) => {
    setArtisansLoading(true);
    const { artisans, pages, pageSize } = await getArtisans(maker_id, sculpt, page);
    setSculpt(sculpt);
    setArtisans(artisans);
    setPage(page);
    setPages(pages);
    setPageSize(pageSize);
    setArtisansLoading(false);
  };

  const navigateToSculpt = sculptDef => e => {
    if (preventUnlessNewTab(e)) return;
    history.push(encodeURI(`/catalogs/${slug}/${sculptDef.sculpt}`));
    setSculpt(sculptDef.sculpt);
    return false;
  };

  const sculptsEl = sculptsLoading
    ? <DataLoading />
    : (
      <Nav vertical>
        {sculpts.map(s =>
          <NavItem key={s.sculpt}>
            <NavLink href={`/catalogs/${slug}/${s.sculpt}`} onClick={navigateToSculpt(s)}>
              {s.sculpt} <Badge color="info" pill>{s.count}</Badge>
            </NavLink>
          </NavItem>
        )}
      </Nav>
    );

  const onPageChange = (newPage) => {
    loadSculpt(sculpt, newPage);
  };

  const breadcrumbs = (
    <Row>
      <Col>
        <Breadcrumb>
          <BreadcrumbItem><RouterNavLink to="/artisans">Artisans</RouterNavLink></BreadcrumbItem>
          {sculpt ? (
            <>
            <BreadcrumbItem><RouterNavLink to={`/catalogs/${slug}`}>{maker}</RouterNavLink></BreadcrumbItem>
            <BreadcrumbItem>{sculpt}</BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>{maker}</BreadcrumbItem>
          )}
        </Breadcrumb>
      </Col>
    </Row>
  );
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
      {breadcrumbs}
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
