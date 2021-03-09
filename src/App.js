import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
//import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  //config from firebase
})

const auth = firebase.auth();
const firestore = firebase.firestore();
//const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className='name'>Trapp-chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

//Sign in function
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

//Sign in logic
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

//Chat room logic
function ChatRoom() {
  const dummy = useRef();
  //Drawing a reference to messages in the database
  const messagesRef = firestore.collection('messages');
  //setting the order and message limit
  const query = messagesRef.orderBy('createdAt').limit(25);
  //Getting messages from firebase
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

//Sending a message within the chat
  const sendMessage = async (e) => {
    e.preventDefault();

    //Fetch user and image from auth
    const { uid, photoURL } = auth.currentUser;
    //Adding  new message to firebase and saving details
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
     //Resetting our form to an empty string
    setFormValue(''); 
    //Scroll bar to be on last message(down)
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
  <>
    <main>
      {/* Mapping through the messages array to display */}
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      
      {/* Scroll bar to be on last message(down) */}
      <span ref={dummy}></span>
    </main>

    {/* Creating a form to send user input */}
    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message" />

      <button type="submit" disabled={!formValue}>🕊Send</button>

    </form>
  </>)
}

//Displaying chat messages
function ChatMessage(props) {
  // Destructure our essentials from the props and display
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      {/* Get a custom avatar if user has no image(gravatar) */}
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
