import React, { useState } from 'react';
import {
  Table, Badge,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import classnames from 'classnames';
import _ from 'lodash';

import DataLoading from '../components/DataLoading';
import ReviewRow from '../components/ReviewRow';
import ImageSubReview from '../components/ImageSubReview';
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
  const [imageSubmissions, setImageSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('1');

  useState(() => {
    getSubmissions(getTokenSilently).then(({ submissions, imageSubmissions }) => {
      setSubmissions(submissions);
      setImageSubmissions(imageSubmissions);
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

  const approve = async s => process('approve', s);
  const reject = async s => process('reject', s);

  const update = async s => {
    if (s.newMaker) {
      s.maker = s.newMaker;
    }
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

  const artisans = submissions.length > 0 ? (
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
  ) : <div className="no-hits">No artisan submissions to review</div>;

  const images = imageSubmissions.length > 0
    ? <ImageSubReview submissions={imageSubmissions} onUpdate={s => setImageSubmissions(s)} />
    : <div className="no-hits">No image submissions to review</div>;

  const toggle = tab => (activeTab !== tab) ? setActiveTab(tab) : null;

  if ((submissions.length + imageSubmissions.length) < 1) {
    return <div className="no-hits">Nothing to review</div>;
  }

  if (submissions.length === 0) {
    setActiveTab('1');
  }

  return (
    <div className="mkb-submissions">
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '1' })}
            onClick={() => { toggle('1') }}
          >
            Artisans <Badge color="secondary">{submissions.length}</Badge>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '2' })}
            onClick={() => { toggle('2') }}
          >
            Images <Badge color="secondary">{imageSubmissions.length}</Badge>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {artisans}
        </TabPane>
        <TabPane tabId="2">
          {images}
        </TabPane>
      </TabContent>
    </div>
  );
};

export default Review;
