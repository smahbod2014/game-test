import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyAFNePLTOKWs2NMNljXmQIUxUuxQan2ruQ",
  authDomain: "game-test-c4bed.firebaseapp.com",
  projectId: "game-test-c4bed",
  storageBucket: "game-test-c4bed.appspot.com",
  messagingSenderId: "99636756606",
  appId: "1:99636756606:web:a262580aba6761cf74582f",
  measurementId: "G-LYCD2N4TB2",
};

const Firebase = firebase.initializeApp(firebaseConfig);

export default Firebase;
