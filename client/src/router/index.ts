import ErrorView from "@client/views/ErrorView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/posts",
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@client/views/LoginView.vue"),
    },
    {
      path: "/administration",
      name: "administration",
      component: () => import("@client/views/admin/UsersView.vue"),
    },
    {
      path: "/posts",
      name: "posts",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@client/views/PostsView.vue"),
    },
    {
      path: "/posts/post/:id([1-9][0-9]*)",
      name: "post",
      component: () => import("@client/views/PostView.vue"),
    },
    {
      path: "/posts/post/new",
      name: "new-post",
      component: () => import("@client/views/PostFormView.vue"),
    },
    {
      path: "/posts/post/:postId([1-9][0-9]*)/edit",
      name: "edit-post",
      component: () => import("@client/views/PostFormView.vue"),
      props: true,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: ErrorView,
    },
  ],
});

export default router;
