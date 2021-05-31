import { Button, Spinner } from "reactstrap";
import Firebase from "../config/firebase";
import { useState } from "react";

function onLoginClicked() {
  Firebase.auth().signInAnonymously();
}

function onLogoutClicked() {
  Firebase.auth().signOut();
}

function Login() {
  const [LoggedIn, setLoggedIn] = useState(false);
  const [Loading, setLoading] = useState(true);

  Firebase.auth().onAuthStateChanged((user) => {
    setLoggedIn(user != null);
    setLoading(false);
  });

  if (Loading) {
    return <Spinner color="info" children="" />;
  }

  return (
    <>
      <h1>Login Page</h1>
      {LoggedIn ? (
        <Button className="mt-5" color="info" onClick={onLogoutClicked}>
          Log out
        </Button>
      ) : (
        <Button className="mt-5" color="info" onClick={onLoginClicked}>
          Log in as guest
        </Button>
      )}
    </>
  );
}

export default Login;
