import React, { useState } from "react";
import {
  Button, Container, Row, Col,
  Form, FormGroup, Label, Input,
} from "reactstrap";

import Alert from '../components/Alert';
import Loading from "../components/Loading";
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

  useState(() => {
    getUser(getTokenSilently).then(user => {
      setUser(user);
      setLoadingUser(false);
    });
  }, [getTokenSilently]);

  if (loading || loadingUser || !profile || !user) {
    return <Loading />;
  }

  if (!name) setName(user.name || profile.name);
  if (!nickname) setNickname(user.nickname ||
  profile.nickname);

  const handleSave = async () => {
    user.name = name;
    user.nickname = nickname;
    try {
      await saveUser(getTokenSilently, user);
      setInfo({ message: 'Profile saved.', type: 'info' });
    } catch (err) {
      setInfo({ message: `Error saving the profile: ${err}`, type: 'danger' });
    }
  };

  const alert = info ? <Alert {...info} /> : null;

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
          onChange={e => setNickname(e.target.value)}
        />
      </FormGroup>

      <Button onClick={handleSave}>Save</Button>
    </Form>
  );
};

export default Profile;
