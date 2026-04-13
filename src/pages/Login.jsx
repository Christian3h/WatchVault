import styles from './Login.module.css'
import Button from "../components/Button/Button";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import { db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";



function Login() {

  const navigate = useNavigate();

  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const tokenParaYouTube = credential.accessToken;
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        youtubeToken: tokenParaYouTube,
        //timestamps
        createdAt: user.metadata.creationTime
          ? new Date(user.metadata.creationTime).toISOString()
          : new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        theme: 'dark',
      }, { merge: true });

       navigate('/', { replace: true });
      } catch {
        // Error silencioso en producción
      }
  }

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
