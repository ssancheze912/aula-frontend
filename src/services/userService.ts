import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export interface UserProfile {
  uid: string
  firstName: string
  lastName: string
  username: string
  email: string
  avatarUrl: string
  provider: 'email' | 'google'
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()))
  return !snap.exists()
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const batch = writeBatch(db)
  batch.set(doc(db, 'users', profile.uid), {
    ...profile,
    username: profile.username.toLowerCase(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'usernames', profile.username.toLowerCase()), { uid: profile.uid })
  await batch.commit()
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}
