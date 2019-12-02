import React, { useState } from 'react';
import {
  Container, Row, Col, Button,
  FormGroup, Label, Input,
} from 'reactstrap';

import { useAuth0 } from '../react-auth0-spa';
import DataLoading from '../components/DataLoading';
import getUser from '../actions/getUser';

const MultiCapUpload = props => {
  const { getTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [wantsCredit, setWantsCredit] = useState(true);
  const [author, setAuthor] = useState('');

  useState(() => {
    setLoading(true);
    getUser(getTokenSilently).then(user => {
      setAuthor(user.nickname || (user.email && user.email.split('@')[0]));
      setLoading(false);
    });
  }, []);

  if (loading) return <DataLoading />;

  const imageHandler = async (e) => {
    const { files } = e.target;
    const previews = [];
    const images = [];

    setLoading(true);
    console.log('files', files);
    Array.from(files).forEach(file => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setImages(images);
          setPreviews(previews);
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
      images.push(file);
    });
  };

  const formEl = (
    <Row>
      <Col>
        <FormGroup className="mkb-files">
          <Label for="image">
            To start the submission process, select or drag the
            artisan images to the box below:
          </Label>
          <Input type="file" name="file" id="image" onChange={imageHandler} multiple />
        </FormGroup>
      </Col>
    </Row>
  );

  console.log('images', images);
  console.log('previews', previews);


  return (
    <div>
      {formEl}
    </div>
  );
};

export default MultiCapUpload;
