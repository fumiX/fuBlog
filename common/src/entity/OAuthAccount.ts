import { User } from "./User";
import type { SupportedOAuthProvider } from "./SupportedOAuthProvider";


export type OAuthAccount = {
    id?: number
    oauthId: string
    user: User
    provider: SupportedOAuthProvider
}
