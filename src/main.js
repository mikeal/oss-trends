import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import firebase from 'firebase'
import router from './router'
import { Pie, Bar, Line, mixins } from 'vue-chartjs'
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
  props: ['chartData'],
  mixins: [mixins.reactiveProp],
  mounted () {
    let opts = {
      responsive: true,
      maintainAspectRatio: true,
      legend: false
    }
    this.renderChart(this.chartData, opts)
  }
})

Vue.component('fancy-bar', {
  extends: Bar,
  props: ['chartData'],
  mixins: [mixins.reactiveProp],
  mounted () {
    let opts = {
      responsive: true,
      maintainAspectRatio: true,
      legend: false,
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            fontFamily: 'Courier'
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            fontFamily: 'Courier'
          }
        }]
      }
    }
    this.renderChart(this.chartData, opts)
  }
})

Vue.component('fancy-line', {
  extends: Line,
  props: ['chartData'],
  mixins: [mixins.reactiveProp],
  mounted () {
    let opts = {
      responsive: true,
      maintainAspectRatio: true,
      legend: false,
      scales: {
        xAxes: [{
          ticks: {
            fontFamily: 'Courier'
          }
        }],
        yAxes: [{
          ticks: {
            fontFamily: 'Courier'
          }
        }]
      }
    }
    this.renderChart(this.chartData, opts)
  }
})
