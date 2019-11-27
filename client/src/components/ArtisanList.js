import React, { useState } from 'react';
import {
  Container, Row, Col,
  Pagination, PaginationItem, PaginationLink,
} from 'reactstrap';

import ArtisanCard from './ArtisanCard';
import addArtisanToList from '../actions/addArtisanToList';

const ArtisanList = (props) => {
  const {
    artisans, searchTerm, onRemove, page, pages, onPageChange
  } = props;
  const { isAuthenticated, getTokenSilently } = props;
  const [processing, setProcessing] = useState(null);

  if (searchTerm && artisans && !artisans.length) {
    return <Container><Row><Col>No matches for <b>{searchTerm}</b></Col></Row></Container>;
  }

  const notifyPageChange = (page) => onPageChange && onPageChange(page);
  const pageNum = page && parseInt(page, 10);
  const numPages = pages && parseInt(pages, 10);
  const total = artisans.length;
  const perRow = props.perRow || 3;
  const toAdd = perRow - (total % perRow);
  if (toAdd < perRow) {
    for (let i = 0; i < toAdd; i++) artisans.push(null);
  }

  const add = async (list, artisan) => {
    const token = await getTokenSilently();
    setProcessing(artisan.artisan_id);
    await addArtisanToList(token, list, artisan.artisan_id);
    setProcessing(null);
  };

  const pagination = pages && numPages > 1 && (
    <Row>
      <Col className="mkb-pagination">
        <Pagination aria-label="Artisans navigation">
          <PaginationItem disabled={ pageNum === 1 }>
            <PaginationLink
              first href="#"
              onClick={_ => notifyPageChange(1)}
            />
          </PaginationItem>
          <PaginationItem>
          <PaginationItem disabled={ pageNum === 1 }>
            <PaginationLink
              previous href="#"
              onClick={_ => notifyPageChange(pageNum-1)}
            />
          </PaginationItem>
          </PaginationItem>
          {Array(...Array(numPages)).map((_, i) => (
            <PaginationItem active={i+1 === pageNum} key={i}>
              <PaginationLink href="#" onClick={_ => notifyPageChange(i+1)}>
                {i+1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem disabled={ pageNum === numPages }>
            <PaginationLink
              next href="#"
              onClick={_ => notifyPageChange(pageNum+1)}
            />
          </PaginationItem>
          <PaginationItem disabled={ pageNum === numPages }>
            <PaginationLink
              last href="#"
              onClick={_ => notifyPageChange(numPages)}
            />
          </PaginationItem>
        </Pagination>
      </Col>
    </Row>
  );

  const artisanCard = (a, i) => !!a
    ? <ArtisanCard
      isAuthenticated={isAuthenticated}
      key={a.artisan_id}
      onRemove={onRemove}
      onAdd={add}
      artisan={a}
      processing={a.artisan_id === processing}
    />
    : <Col key={i}></Col>;

  return (
    <Container>
      {pagination}
      <Row>
        {artisans.map(artisanCard)}
      </Row>
      {pagination}
    </Container>
  );
}

export default ArtisanList;
