import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-lodash-debounce'
import {
  Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import DataLoading from './DataLoading';
import './Search.css';

const Search = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [artisans, setArtisans] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const search = async terms => {
      try {
        const response = await fetch(`/api/artisans/?q=${terms}`);
        return await response.json();
      } catch (error) {
        console.error('Error during search', error);
      }
    }

    if (!debouncedSearchTerm) return;

    setLoading(true);
    search(debouncedSearchTerm).then(artisans => {
      setLoading(false);
      setResultsOpen(true);
      setArtisans(artisans);
    });
  }, [debouncedSearchTerm]);

  const clearSearch = () => {
    setArtisans(null);
    setSearchTerm('');
  };

  const artisansEl = artisans && artisans.length
    ? artisans.map((a, i) => (
      <DropdownItem
        key={i}
        href={encodeURI(`/artisans/${a.artisan_id}-${a.sculpt}-${a.colorway}`)}>
          <img src={a.image} width="80" alt={`${a.sculpt} ${a.colorway}`} />
          &nbsp;
          {a.maker} {a.sculpt} {a.colorway}
      </DropdownItem>
    ))
    : <DropdownItem>No matches for <b>{debouncedSearchTerm}</b></DropdownItem>

  const results = loading
    ? <DropdownItem><DataLoading /></DropdownItem>
    : (artisans ? artisansEl
                : <DropdownItem>Type terms to start the search</DropdownItem>);

  const toggle = () => setResultsOpen(prevState => !prevState);
  const clearIcon = debouncedSearchTerm && <FontAwesomeIcon
    className="clear"
    color="black"
    icon={faTimes}
    onClick={clearSearch} />;

  return (
    <>
      <Dropdown isOpen={resultsOpen} toggle={toggle}>
        <DropdownToggle tag="div" className="clear">
          <Input
            type="text"
            name="search"
            id="exampleSearch"
            placeholder="maker, sculpt, colorway"
            autoComplete="off"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {clearIcon}
        </DropdownToggle>
        <DropdownMenu>
          {results}
        </DropdownMenu>
      </Dropdown>
    </>
  );
};

export default Search;
