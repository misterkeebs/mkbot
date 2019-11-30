import React, { useState } from "react";
import {
  Button, Form, FormGroup, Label, Input,
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
  const [notifications, setNotifications] = useState(true);
  const [info, setInfo] = useState(null);
  const [saving, setSaving] = useState(null);

  useState(() => {
    getUser(getTokenSilently).then(user => {
      console.log('user', user);
      setUser(user);
      setName(user.name || profile.name);
      setNickname(user.nickname || profile.nickname);
      setNotifications(user.notifications);
      setLoadingUser(false);
    });
  }, [getTokenSilently]);

  if (loading || !profile) {
    return <Loading />;
  }

  if (loadingUser || !user) {
    return <DataLoading />
  }

  const handleSave = async () => {
    user.name = name;
    user.nickname = nickname;
    user.notifications = notifications;

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
      <FormGroup check>
        <Label for="notifications">
          <Input
            type="checkbox" name="notifications" id="notifications"
            autoComplete="off"
            disabled={saving} checked={notifications}
            onChange={e => setNotifications(e.target.checked)}
          />{' '}
          Receive email notifications
        </Label>
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
