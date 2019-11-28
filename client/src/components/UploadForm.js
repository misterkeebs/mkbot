import React, { useState } from 'react';
import {
  Container, Row, Col, Button,
  Form, FormGroup, Label, Input,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faTimes,
} from '@fortawesome/free-solid-svg-icons'

const UploadForm = props => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  const imageHandler = async (e) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      setLoading(false);
      setPreview(reader.result);
    };

    reader.readAsDataURL(e.target.files[0]);
    setImage(e.target.files[0]);

    props.onPreview && props.onPreview(e.target.files[0]);
  };

  const formEl = (
    <Col>
      <FormGroup className="mkb-files">
        <Label for="image">
          To start the submission process, select or drag the
          artisan image to the box below:
        </Label>
        <Input type="file" name="file" id="image" onChange={imageHandler} />
      </FormGroup>
    </Col>
  );

  const previewEl = (
    <Col className="mkb-file-preview">
      <img src={preview} alt="Preview" />
    </Col>
  );

  const save = async () => {
    console.log('submitting');
  };

  const cancel = async () => {
    if (!preview || window.confirm('Are you sure you want to cancel?')) {
      setImage(null);
      setPreview(false);
      props.onCancel && props.onCancel();
    }
  }

  const actions = (
    <Row className="actions">
      <Col>
        {preview &&
          <><Button color="primary" onClick={_ => save()}>
            <FontAwesomeIcon icon={faCheck} color="white" />{' '}
            Save
          </Button>{' '}</>
        }
        <Button color="danger" onClick={_ => cancel()}>
          <FontAwesomeIcon icon={faTimes} color="white" />{' '}
          Cancel
        </Button>
      </Col>
    </Row>
  );

  return (
    <Container>
      <Row>
        {preview ? previewEl : formEl}
      </Row>
      {actions}
    </Container>
  );
};

export default UploadForm;
