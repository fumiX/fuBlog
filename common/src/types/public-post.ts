import { Post } from "@common/entity/Post.js";
import { LoggedInUserInfo } from "@common/types/logged-in-user-info.js";

export type PublicPost = {
  id: number | undefined;
  title: string;
  description: string;
  created:
    | {
        at: Date;
        by: string | undefined;
      }
    | undefined;
  updated:
    | {
        at: Date;
        by: string | undefined;
      }
    | undefined;
  draft: boolean;
  tags: string[];
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
};

export function createPublicPostFromPostEntity(loggedInUser: LoggedInUserInfo | undefined, post: Post): PublicPost {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    tags: post.tags?.map((it) => it.name) ?? [],
    created: post.createdAt ? { at: post.createdAt, by: post.createdBy?.fullName } : undefined,
    updated: post.updatedAt ? { at: post.updatedAt, by: post.updatedBy?.fullName } : undefined,
    draft: post.draft,
    permissions: {
      canEdit: loggedInUser?.permissions?.canEditPost === true || loggedInUser?.user?.id === post.createdBy?.id,
      canDelete: loggedInUser?.permissions?.canDeletePost === true || loggedInUser?.user?.id === post.createdBy?.id,
    },
  };
}
