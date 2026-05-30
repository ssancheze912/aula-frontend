import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../config/firebase'

// Solo correos institucionales: el dominio debe terminar en .edu o .edu.<tld>
// (ej. universidad.edu, correounivalle.edu.co).
const EDU_EMAIL_RE = /@[^\s@]+\.edu(\.[a-z]{2,})?$/i

export const isInstitutionalEmail = (email: string): boolean =>
  EDU_EMAIL_RE.test(email.trim())

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())

export const logout = () => signOut(auth)

export const getIdToken = (user: User) => user.getIdToken()
