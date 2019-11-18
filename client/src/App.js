import React from "react";
import { Router, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';

import PrivateRoute from './components/PrivateRoute';
import Loading from './components/Loading';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { useAuth0 } from './react-auth0-spa';
import history from './utils/history';

import Message from './components/Message';
import Home from './views/Home';
import Bot from './views/Bot';
import Artisans from './views/Artisans';
import Catalogs from './views/Catalogs';
import Catalog from './views/Catalog';
import Dashboard from './views/Dashboard';
import Submission from './views/Submission';
import Profile from './views/Profile';
import MyArtisans from './views/MyArtisans';

// styles
import './App.css';

// fontawesome
import initFontAwesome from './utils/initFontAwesome';
import WishList from './views/WishList';
initFontAwesome();

const App = () => {
  const { loading } = useAuth0();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Message />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/bot" exact component={Bot} />
            <Route path="/artisans" exact component={Artisans} />
            <Route path="/catalogs/:slug" component={Catalog} />
            <Route path="/catalogs" component={Catalogs} />
            <PrivateRoute path="/dashboard" exact component={Dashboard} />
            <PrivateRoute path="/submit" exact component={Submission} />
            <PrivateRoute path="/my-artisans" exact component={MyArtisans} />
            <PrivateRoute path="/wishlist" exact component={WishList} />
            <PrivateRoute path="/profile" component={Profile} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
