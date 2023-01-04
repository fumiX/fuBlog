import type { User } from "./User.js";
import type { SupportedOAuthProvider } from "./SupportedOAuthProvider.js";


export type OAuthAccount = {
    id?: number
    oauthId: string
    user: User
    provider: SupportedOAuthProvider
}
