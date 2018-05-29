import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import Auth from './components/Auth.vue'
import AuthSuccess from './components/AuthSuccess.vue'
// import User from './components/User'
import Month from './components/github/Month'
// import Repo from './components/Repo'
import Org from './components/Org'

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/auth', component: Auth },
    { path: '/success', component: AuthSuccess },
    // { path: '/user/:user', component: User },
    { path: '/github/org/:org', component: Org },
    { path: '/github/:year/:month', component: Month }
  ]
})

export default router
