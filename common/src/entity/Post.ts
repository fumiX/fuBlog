import type { User } from "./User";

export type Post = {
    id?: number
    title: string
    description: string
    markdown: string
    sanitizedHtml: string
    createdAt: Date
    createdBy?: User
    updatedAt?: Date
    updatedBy?: User
}
