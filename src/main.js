import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import firebase from 'firebase'
import router from './router'
import { Pie } from 'vue-chartjs'
require('./firebase')

Vue.config.productionTip = false
Vue.use(VueRouter)

new Vue({
  router,
  created () {
    firebase.auth().onAuthStateChanged(user => {
      // if (user) this.$router.push('/success')
      // else this.$router.push('/auth')
    })
  },
  render: h => h(App)
}).$mount('#app')

Vue.component('pie-chart', {
  extends: Pie,
  props: ['labels', 'datasets'],
  mounted () {
    this.renderChart({
      labels: this.labels,
      datasets: this.datasets
    },
    { responsive: true,
      maintainAspectRatio: false
    }
    )
  }
})
