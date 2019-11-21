import React, { useState } from 'react';
import {
  Table, ButtonGroup, Button
} from 'reactstrap';
import _ from 'lodash';

import DataLoading from '../components/DataLoading';
import { useAuth0 } from "../react-auth0-spa";

const getSubmissions = async (getTokenSilently) => {
  const token = await getTokenSilently();
  const response = await fetch('/api/submissions', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.json();
};

const performAction = async (getTokenSilently, action, submission_id) => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/submissions/${submission_id}/${action}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

const Review = () => {
  const { getTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useState(() => {
    getSubmissions(getTokenSilently).then(subs => {
      setSubmissions(subs);
      setLoading(false);
    });
  });

  if (loading) {
    return <DataLoading />;
  }

  const process = async (action, s) => {
    await performAction(getTokenSilently, action, s.submission_id);
    const newSubmissions = _.clone(submissions);
    const pos = newSubmissions.indexOf(s);
    newSubmissions.splice(pos, 1);
    setSubmissions(newSubmissions);
  };

  const approve = s => async e => process('approve', s);
  const reject = s => async e => process('reject', s);

  return (
    <Table>
      <tbody>
        {submissions.map(s => (
          <tr key={s.submission_id}>
            <td width="120px"><img src={s.image} alt="preview" width="100px" /></td>
            <td>
              <b>Maker:</b> {s.maker}<br/>
              <b>Sculpt:</b> {s.sculpt}<br/>
              <b>Colorway:</b> {s.colorway}<br/>
            </td>
            <td>
              {s.nickname || s.user}
            </td>
            <td>
              {s.created_at}
            </td>
            <td align="right">
              <ButtonGroup>
                <Button color="primary" onClick={approve(s)}>Approve</Button>
                <Button color="primary" onClick={reject(s)}>Reject</Button>
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Review;
