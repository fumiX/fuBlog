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
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/administration",
      name: "administration",
      component: () => import("@/views/admin/UsersView.vue"),
    },
    {
      path: "/posts",
      name: "posts",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/PostsView.vue"),
    },
    {
      path: "/posts/post/:id",
      name: "post",
      // route level code-splitting
      // this generates a separate chunk (Articles.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/PostView.vue"),
    },
    {
      path: "/posts/post/form",
      name: "form",
      // route level code-splitting
      // this generates a separate chunk (Articles.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/PostFormView.vue"),
    },
  ],
});

export default router;
