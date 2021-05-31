import { Redirect } from "react-router";
import Firebase from "../config/firebase";

function AuthRoute(props: { children: any }) {
  if (!Firebase.auth().currentUser) {
    return <Redirect to="/login" />;
  }

  return <div>{props.children}</div>;
}

export default AuthRoute;
