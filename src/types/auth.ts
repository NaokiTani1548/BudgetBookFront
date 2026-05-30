export interface AuthUser {
  userId: string
  email: string
  name: string
}

export interface AuthResponse {
  token: string
  userId: string
  email: string
  name: string
}

export interface GoogleAuthUrlResponse {
  url: string
  state: string
}