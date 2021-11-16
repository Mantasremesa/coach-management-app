import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import CreateMember from '../views/createMember.vue'
import CoachTree from '../views/coachTree.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'CreateMemberForm',
    component: CreateMember,
  },
  {
    path: '/coach-tree',
    name: 'CoachTree',
    component: CoachTree,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
