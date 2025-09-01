// types.ts

export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  verified: boolean
  createdAt: string // ISO string from backend
  updatedAt: string
}

export type Task = {
  id: number
  title: string
  description: string
  effortDays: number
  dueDate: string // ISO string (convert to Date on frontend if needed)
  userId: number
  createdAt: string
  updatedAt: string
}
