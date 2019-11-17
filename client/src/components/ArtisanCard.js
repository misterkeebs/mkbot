import React, { useState } from 'react';
import {
  Col, Card, CardImg, CardBody,
  CardTitle, CardSubtitle, CardImgOverlay,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt, faTimes, faCheck,
} from '@fortawesome/free-solid-svg-icons'

import DataLoading from './DataLoading';

function formatName(data) {
  const colorway = data.colorway ? ` ${data.colorway}` : '';
  return `${data.sculpt}${colorway}`;
}

const ArtisanCard = (props) => {
  const [showIcons, setShowIcons] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { artisan, onRemove, processing } = props;

  const cancel = () => {
    setShowConfirm(false);
  };

  const confirm = () => {
    onRemove && onRemove(artisan);
    setShowIcons(false);
    setShowConfirm(false);
  };

  const processingOverlay = processing && (
    <CardImgOverlay className="processing">
      <DataLoading />
    </CardImgOverlay>
  );

  const removeOverlay = onRemove && ((showConfirm &&
    <CardImgOverlay
      style={{display: showConfirm ? 'block' : 'none'}}
    >
      <FontAwesomeIcon icon={faTimes} color="black" onClick={cancel} /> &nbsp;
      <FontAwesomeIcon icon={faCheck} color="black" onClick={confirm} />
    </CardImgOverlay>)
    || (showIcons &&
    <CardImgOverlay
      style={{display: showIcons ? 'block' : 'none'}}
    >
      <FontAwesomeIcon
        icon={faTrashAlt} color="black"
        onClick={_ => setShowConfirm(true)} />
    </CardImgOverlay>));

  return (
    <Col key={artisan.artisan_id}
      onMouseEnter={_ => setShowIcons(true) }
      onMouseLeave={_ => { setShowIcons(false); setShowConfirm(false); } }
    >
      <Card className="mkb-artisan-card">
        <CardImg
          top width="20%"
          src={artisan.image}
          alt={artisan.sculpt}
        />
        {processingOverlay}
        {removeOverlay}
        <CardBody>
          <CardTitle><b>{formatName(artisan)} </b></CardTitle>
          <CardSubtitle>{artisan.maker}</CardSubtitle>
        </CardBody>
      </Card>
    </Col>
  );
}

export default ArtisanCard;
