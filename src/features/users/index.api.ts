import { createApiBuilder } from "../../state/createApi";
import { FollowDto } from "./index.type";

export interface Follower {
  followerId:  number
  followingId: number
}

export interface User {
  id: number;
  username: string;
  bio: string;

  // recipes     Recipe[]

  followers: Follower[]
  following: Follower[]
}

const api = createApiBuilder({
  baseUrl: 'https://pwa.baby:8000/',
  prepareHeader: headers => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

export const getMe = api.endpoint<undefined, User>({
  build: () => ({
    path: `users/me`,
  }),
  tags: ['USER_ME'],
  
});

export const getUser = api.endpoint<number, User>({
  build: (userId) => ({
    path: `users/${userId}`,
  }),
  tags: ['USER'],
});

export const followUser = api.endpoint<FollowDto, User>({
  build: (dto) => ({
    path: `followers/follow`,
    method: 'POST',
    body: dto
  }),
  tags: ['USER'],
});

export const unfollowUser = api.endpoint<FollowDto, User>({
  build: (dto) => ({
    path: `followers/unfollow`,
    method: 'DELETE',
    body: dto
  }),
  tags: ['USER'],
});