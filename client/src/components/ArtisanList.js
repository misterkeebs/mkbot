import React from 'react';
import {
  Container, Row, Col,
} from 'reactstrap';

import ArtisanCard from './ArtisanCard';

const ArtisanList = (props) => {
  const { artisans, searchTerm, onRemove, onAdd, processing } = props;
  if (searchTerm && artisans && !artisans.length) {
    return <Container><Row><Col>No matches for <b>{searchTerm}</b></Col></Row></Container>;
  }

  return (
    <Container>
      <Row>
        {artisans.map(a => <ArtisanCard
                              key={a.artisan_id}
                              onRemove={onRemove}
                              onAdd={onAdd}
                              artisan={a}
                              processing={a.artisan_id === processing}
                            />)}
      </Row>
    </Container>
  );
}

export default ArtisanList;
