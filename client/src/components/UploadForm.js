import React, { useState } from 'react';
import {
  Container, Row, Col, Button,
  FormGroup, Label, Input,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faTimes,
} from '@fortawesome/free-solid-svg-icons';

import { useAuth0 } from '../react-auth0-spa';
import DataLoading from '../components/DataLoading';
import getUser from '../actions/getUser';

const UploadForm = props => {
  const { getTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [wantsCredit, setWantsCredit] = useState(true);
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('')

  useState(() => {
    setLoading(true);
    getUser(getTokenSilently).then(user => {
      setAuthor(user.nickname || (user.email && user.email.split('@')[0]));
      setLoading(false);
    });
  }, []);

  if (loading) return <DataLoading />;

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
    <Row>
      <Col>
        <FormGroup className="mkb-files">
          <Label for="image">
            To start the submission process, select or drag the
            artisan image to the box below:
          </Label>
          <Input type="file" name="file" id="image" onChange={imageHandler} />
        </FormGroup>
      </Col>
    </Row>
  );

  const previewEl = (
    <>
      <Row>
        <Col className="mkb-file-preview">
          <img src={preview} alt="Preview" />
        </Col>
      </Row>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <FormGroup check>
            <Label for="wantsCredit">
              <Input
                type="checkbox" name="wantsCredit" id="wantsCredit"
                autoComplete="off"
                disabled={saving} checked={wantsCredit}
                onChange={e => setWantsCredit(e.target.checked)}
              />{' '}
              Credit me for the submission
            </Label>
          </FormGroup>
          {wantsCredit && <FormGroup>
            <Label for="author">How do you want to be credited as?</Label>
            <Input
              type="text" name="author" id="author"
              autoComplete="off"
              value={author} disabled={saving}
              onChange={e => setAuthor(e.target.value)}
            />
          </FormGroup>}
          {!wantsCredit && <FormGroup>
            <Label>This submission will be sent anonymously.</Label>
          </FormGroup>}
          {false && <FormGroup>
            <Label for="description">Optionally, describe your picture:</Label>
            <Input
              type="text" name="description" id="description"
              autoComplete="off"
              value={description} disabled={saving}
              onChange={e => setDescription(e.target.value)}
            />
          </FormGroup>}
        </Col>
      </Row>
    </>
  );

  const save = async () => {
    const { onSave } = props;
    if (!onSave) return;
    setSaving(true);
    await onSave(image, { wantsCredit, author, description });
    setSaving(false);
    setImage(null);
    setPreview(false);
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
      {preview ? previewEl : formEl}
      {saving ? <DataLoading /> : actions}
    </Container>
  );
};

export default UploadForm;
