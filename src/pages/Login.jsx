import styles from './Login.module.css'
import Button from "../components/Button/Button";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import { db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";


async function handleGoogleSignIn() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);

    await setDoc(userDocRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,

      //timestamps
      createdAt: user.metadata.creationTime
        ? new Date(user.metadata.creationTime).toISOString()
        : new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      theme: 'dark',
    }, { merge: true });
  } catch (error) {
    console.log(error);
  }
}

function Login() {

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>WatchVault</h1>

      <Button onClick={handleGoogleSignIn} className={styles.button}>
        <FcGoogle />
        Iniciar sesion con Google
      </Button>
    </div>
  )
}

export default Login;
