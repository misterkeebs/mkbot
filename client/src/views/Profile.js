import React, { useState } from "react";
import {
  Button, Container, Row, Col,
  Form, FormGroup, Label, Input,
} from "reactstrap";

import Alert from '../components/Alert';
import Loading from "../components/Loading";
import DataLoading from "../components/DataLoading";
import getUser from "../actions/getUser";
import saveUser from "../actions/saveUser";
import { useAuth0 } from "../react-auth0-spa";

const Profile = () => {
  const { loading, getTokenSilently, user: profile } = useAuth0();
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [info, setInfo] = useState(null);
  const [saving, setSaving] = useState(false);

  useState(() => {
    getUser(getTokenSilently).then(user => {
      setUser(user);
      setLoadingUser(false);
    });
  }, [getTokenSilently]);

  if (loading || !profile) {
    return <Loading />;
  }

  if (loadingUser || !user) {
    return <DataLoading />
  }

  if (!name) setName(user.name || profile.name);
  if (!nickname) setNickname(user.nickname || profile.nickname);

  const handleSave = async () => {
    user.name = name;
    user.nickname = nickname;

    setSaving(true);
    try {
      await saveUser(getTokenSilently, user);
      setInfo({ message: 'Profile saved.', type: 'info' });
    } catch (err) {
      setInfo({ message: `Error saving the profile: ${err}`, type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAlert = _ => {
    setInfo(null);
    return true;
  };
  const alert = info ? <Alert {...info} onDismiss={handleCloseAlert} /> : null;

  return (
    <Form>
      {alert}
      <FormGroup>
        <Label for="name">Name</Label>
        <Input
          type="text"
          name="name"
          id="name"
          value={name}
          disabled={saving}
          onChange={e => setName(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label for="nickname">Nickname</Label>
        <Input
          type="text"
          name="nickname"
          id="nickname"
          value={nickname}
          disabled={saving}
          onChange={e => setNickname(e.target.value)}
        />
      </FormGroup>

      <Button onClick={handleSave} disabled={saving}>
        {saving ?
          <div>
            <DataLoading size="sm" />
          </div> : 'Save'}
      </Button>
    </Form>
  );
};

export default Profile;
