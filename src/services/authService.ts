import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../config/firebase'

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())

export const logout = () => signOut(auth)

export const getIdToken = (user: User) => user.getIdToken()
