import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Col, Card, CardImg, CardBody,
  CardTitle, CardSubtitle, CardImgOverlay,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt, faTimes, faCheck, faListAlt, faHeart,
} from '@fortawesome/free-solid-svg-icons'
import Sugar from 'sugar';

import DataLoading from './DataLoading';

function formatName(data) {
  const colorway = data.colorway ? ` ${data.colorway}` : '';
  return `${data.sculpt}${colorway}`;
}

const ArtisanCard = (props) => {
  const { isAuthenticated } = props;
  const history = useHistory();
  const [showIcons, setShowIcons] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { artisan, onRemove, onAdd, processing } = props;

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

  const addTo = (list) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd && onAdd(list, artisan);
    return false;
  };

  const navigateTo = a => e => {
    e.preventDefault();
    e.stopPropagation();
    const url = encodeURI(`/artisans/${a.artisan_id}-${a.sculpt}-${a.colorway}`);
    history.push(url);
  };

  const addOverlay = onAdd && (showIcons &&
    <CardImgOverlay
      style={{display: showIcons ? 'block' : 'none', cursor: 'pointer'}}
      onClick={navigateTo(artisan)}
    >
      <FontAwesomeIcon icon={faListAlt} color="black" onClick={addTo('list')} /> &nbsp;
      <FontAwesomeIcon icon={faHeart} color="black" onClick={addTo('wishlist')} />
    </CardImgOverlay>);

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
      <Card
        className="mkb-artisan-card"
        onClick={navigateTo(artisan)}
      >
        <CardImg
          top width="20%"
          src={artisan.image}
          alt={artisan.sculpt}
        />
        {processingOverlay}
        {isAuthenticated && addOverlay}
        {isAuthenticated && removeOverlay}
        <CardBody>
          <CardTitle><b>{formatName(artisan)} </b></CardTitle>
          <CardSubtitle>
            {artisan.maker}
            {artisan.submitted_by && <div className="credit">
              {artisan.submitted_by}
              &nbsp;·&nbsp;
              {artisan.submitted_at && Sugar.Date.relative(new Date(artisan.submitted_at))}
            </div>}
          </CardSubtitle>
        </CardBody>
      </Card>
    </Col>
  );
}

export default ArtisanCard;
