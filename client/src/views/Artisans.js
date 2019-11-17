import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col,
  FormGroup, Label, Input,
} from 'reactstrap';
import { useDebounce } from 'use-lodash-debounce'

import { useAuth0 } from '../react-auth0-spa';

import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';

const search = async (terms, page=1) => {
  const response = await fetch(`/api/artisans/?q=${terms}&page=${page}`);
  const artisans = await response.json();
  const headers = response.headers;
  return {
    artisans,
    page: headers.get('X-Pagination-Page'),
    pages: headers.get('X-Pagination-TotalPages'),
    pageSize: headers.get('X-Pagination-PerPage'),
  };
};

const addArtisan = async (token, listType, artisan_id) => {
  console.log('addArtisan', token, listType, artisan_id);
  const response = await fetch(`/api/lists/${listType}/${artisan_id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

const Artisans = () => {
  const { getTokenSilently } = useAuth0();

  const [searchTerm, setSearchTerm] = useState('');
  const [artisans, setArtisans] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const searchByTerm = async (term, page) => {
    const { artisans, pages } = await search(debouncedSearchTerm, page);
    setArtisans(artisans);
    setPage(page);
    setPages(pages);
    setLoading(false);
  };

  useEffect(
    () => {
      if (debouncedSearchTerm) {
        setLoading(true);
        search(debouncedSearchTerm, page).then(res => {
          const { artisans, pages } = res;
          setArtisans(artisans);
          setPage(page);
          setPages(pages);
          setLoading(false);
        });
      } else {
        setArtisans([]);
      }
    },
    [debouncedSearchTerm, page]
  );

  const add = async (list, artisan) => {
    console.log('add', list, artisan);
    const token = await getTokenSilently();
    setProcessing(artisan.artisan_id);
    await addArtisan(token, list, artisan.artisan_id);
    setProcessing(null);
  };

  const onPageChange = (newPage) => {
    searchByTerm(debouncedSearchTerm, newPage);
  };

  const result = loading
    ? <DataLoading />
    : (debouncedSearchTerm
        ? <ArtisanList
            artisans={artisans}
            onAdd={add}
            processing={processing}
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
      {result}
    </>
  );
};

export default Artisans;
