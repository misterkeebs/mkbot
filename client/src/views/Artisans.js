import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col,
  FormGroup, Label, Input,
} from 'reactstrap';
import { useDebounce } from 'use-lodash-debounce'

import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';

const search = async (terms) => {
  const response = await fetch(`/api/artisans/?q=${terms}`);
  return response.json();
};

const Artisans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(
    () => {
      if (debouncedSearchTerm) {
        setLoading(true);
        search(debouncedSearchTerm).then(results => {
          setResults(results);
          setLoading(false);
        });
      } else {
        setResults([]);
      }
    },
    [debouncedSearchTerm]
  );

  const result = loading
    ? <DataLoading />
    : (debouncedSearchTerm
        ? <ArtisanList artisans={results} searchTerm={debouncedSearchTerm} />
        : <div></div>
      );

  const summary = (debouncedSearchTerm && results && results.length)
    ? (
      <Row>
        <Col>Showing <b>{results.length}</b> matches for <b>{debouncedSearchTerm}</b></Col>
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
