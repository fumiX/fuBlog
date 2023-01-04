type Permissions = {
    canEditUserRoles: boolean
    canCreatePost: boolean
    canEditPost: boolean
    canDeletePost: boolean
}

export class UserRolePermissions implements Permissions {
    description: string
    canEditUserRoles: boolean
    canCreatePost: boolean
    canEditPost: boolean
    canDeletePost: boolean
    public constructor (description: string, partial: Partial<Permissions>) {
        this.canEditUserRoles = partial.canEditUserRoles || false;
        this.canCreatePost = partial.canCreatePost || false;
        this.canEditPost = partial.canEditPost || false;
        this.canDeletePost = partial.canDeletePost || false;
    }
}
