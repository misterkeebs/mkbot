import React, { useState } from 'react';
import {
  Row, Col,
} from 'reactstrap';
import Sugar from 'sugar';

import DataLoading from './DataLoading';

const ArtisanGallery = props => {
  const { artisan } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const [images, setImages] = useState([]);

  useState(() => {
    const { images } = artisan;
    if (!images[0] || images[0].image_id) {
      images.unshift({
        image: artisan.image,
        created_at: artisan.submitted_at,
        submitted_by: artisan.submitted_by,
      });
    }
    setImages(images);
  }, [artisan]);

  if (!images.length) {
    return <DataLoading />;
  }

  const gridImages = images.length > 1 && images.map((img, i) => {
    return <div>
      <img
        key={i}
        alt={i}
        src={img.image}
        height="100px"
        onClick={_ => setActiveIndex(i)}
      />
    </div>
  });
  const grid = images.length > 1 && (
    <Row className="grid">
      <Col>
        {gridImages}
      </Col>
    </Row>
  );

  const image = images[activeIndex];
  return (
    <>
      <Row className="image">
        <Col>
          <img
            alt={`${artisan.sculpt} ${artisan.colorway}`}
            src={image.image}
          />
          <div className="credit">
            {image.submitted_by && <><b>{image.submitted_by}</b>&nbsp;·&nbsp;</>}
            {image.created_at && Sugar.Date.relative(new Date(image.created_at))}
          </div>
        </Col>
      </Row>
      {grid}
    </>
  );

};

export default ArtisanGallery;
