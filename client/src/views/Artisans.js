import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Badge,
  FormGroup, Label, Input,
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { useDebounce } from 'use-lodash-debounce'
import slugify from 'slugify';

import { useAuth0 } from '../react-auth0-spa';
import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';
import ErrorMessage from '../components/ErrorMessage';

const Artisans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [artisans, setArtisans] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [makers, setMakers] = useState([]);
  const [error, setError] = useState(null);
  const [lastArtisans, setLastArtisans] = useState([]);
  const { user, getTokenSilently, isAuthenticated } = useAuth0();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const search = async (terms, page=1) => {
    try {
      const response = await fetch(`/api/artisans/?q=${terms}&page=${page}`);
      const artisans = await response.json();
      const headers = response.headers;
      return {
        artisans,
        page: headers.get('X-Pagination-Page'),
        pages: headers.get('X-Pagination-TotalPages'),
        pageSize: headers.get('X-Pagination-PerPage'),
      };
    } catch (error) {
      setError(error);
    }
  };

  const getMakers = async () => {
    try {
      const response = await fetch(`/api/makers`);
      return response.json();
    } catch (error) {
      console.error('Error loading makers', error);
      setError(error);
    }
  };

  const getLatestArtisans = async () => {
    try {
      const response = await fetch(`/api/artisans?perPage=9&order=artisan_id+DESC`);
      return response.json();
    } catch (error) {
      console.error('Error loading makers', error);
      setError(error);
    }
  };

  const searchByTerm = async (term, page) => {
    const { artisans, pages } = await search(debouncedSearchTerm, page);
    setArtisans(artisans);
    setPage(page);
    setPages(pages);
    setLoading(false);
  };

  useEffect(
    () => {
      setLoading(true);
      const loadPromises = Promise.all([
        getMakers(),
        getLatestArtisans(),
      ]);
      loadPromises.then(([makers, lastArtisans]) => {
        setMakers(makers);
        setLastArtisans(lastArtisans);

        if (debouncedSearchTerm) {
          search(debouncedSearchTerm, page).then(res => {
            const { artisans, pages } = res;
            setArtisans(artisans);
            setPage(page);
            setPages(pages);
            setLoading(false);
          });
        } else {
          setArtisans([]);
          setLoading(false);
        }
      }).catch(error => setError(error));
    },
    [debouncedSearchTerm, page]
  );

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const onPageChange = (newPage) => {
    searchByTerm(debouncedSearchTerm, newPage);
  };

  const result = loading
    ? <DataLoading />
    : (debouncedSearchTerm
        ? <ArtisanList
            user={user}
            getTokenSilently={getTokenSilently}
            isAuthenticated={isAuthenticated}
            artisans={artisans}
            searchTerm={debouncedSearchTerm}
            pages={pages}
            page={page}
            perRow={4}
            onPageChange={onPageChange}
          />
        : <div></div>
      );

  const summary = (debouncedSearchTerm && artisans && artisans.length)
    ? (
      <Row>
        <Col>Showing <b>{artisans.length}</b> matches for <b>{debouncedSearchTerm}</b></Col>
      </Row>
    ) : null;

  const latest = (lastArtisans && lastArtisans.length) ? (
    <Col>
      <ArtisanList artisans={lastArtisans} />
    </Col>
  ) : null;

  const makersEl = !debouncedSearchTerm && (
    <Container className="mkb-makers">
      <Row>
        <Col xs={3}>
          {makers.map(maker => (
            <Row key={maker.maker_id}>
              <Col>
                <NavLink to={`/catalogs/${maker.maker_id}-${slugify(maker.name)}`}>
                  {maker.name}&nbsp;
                  <Badge color="info" pill>{maker.count}</Badge>
                </NavLink>
              </Col>
            </Row>
          ))}
        </Col>
        <Col xs={9}>
          <h3>Latest Additions</h3>
          {latest}
        </Col>
      </Row>
    </Container>
  );

  return (
    <>
      <Container>
        <Row>
          <Col>
            <FormGroup>
              <Label for="exampleSearch">Search</Label>
              <Input
                type="search"
                name="search"
                id="exampleSearch"
                placeholder="search maker, sculpt and/or colorway"
                autoComplete="off"
                onChange={e => setSearchTerm(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>
        {summary}
      </Container>
      {makersEl}
      {result}
    </>
  );
};

export default Artisans;
