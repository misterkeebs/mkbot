import React, { useState } from 'react';
import {
  Table,
} from 'reactstrap';
import _ from 'lodash';

import DataLoading from '../components/DataLoading';
import ReviewRow from '../components/ReviewRow';
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
  const [editing, setEditing] = useState(false);

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
  const update = async s => {
    console.log('s', s);
    const token = await getTokenSilently();
    const response = await fetch(`/api/submissions/${s.submission_id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(s),
    });
    return response.json();
  };

  return (
    <Table>
      <tbody>
        {submissions.map(s => <ReviewRow
                                key={s.submission_id}
                                submission={s}
                                onApprove={approve}
                                onReject={reject}
                                onUpdate={update}
                              />)}
      </tbody>
    </Table>
  );
};

export default Review;
