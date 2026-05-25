export interface OnlineUser {
  userId: string
  username: string
  avatarUrl: string
  isMuted?: boolean
  isCameraOff?: boolean
  isScreenSharing?: boolean
}

export interface Room {
  id: string
  name: string
  hostId: string
  hostUsername: string
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  senderUsername: string
  senderAvatarUrl: string
  text: string
  createdAt: Date
  type: 'text' | 'system'
}
