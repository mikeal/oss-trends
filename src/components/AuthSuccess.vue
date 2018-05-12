<template>
  <div>
    <h1>Signup succeeded</h1>
    <button v-on:click='logOut'>Log out</button>
    <hr>
    <img :src='user.photoURL' class="avatar"> <br>
    <p>{{user.displayName}}</p>
    <p>{{user.email}}</p>
    <p>{{user.uid}}</p>
  </div>
</template>

<script>
import Vue from 'vue'
import firebaseui from 'firebaseui'
const firebase = require('../firebase')

let data = { user: firebase.auth().currentUser || {} }
firebase.auth().onAuthStateChanged(user => {
  window.user = user
  Vue.set(data, 'user', user)
})

window.firebase = firebase
window.firebaseui = firebaseui

// ;(async () => {
//   const client = new GraphQLClient('https://api.github.com/graphql', {
//     headers: {
//       Authorization: `Bearer ${localStorage.githubToken}`
//     }
//   })

//   const search = 'repo:nodejs/node is:pr 13823 13828'
//   const query = `query {
//     search (query: "${search}", type: ISSUE, first: 10) {
//       nodes {
//         ... on PullRequest {
//           labels(first: 100) {
//             nodes {
//               name
//             }
//           }
//           number
//         }
//       }
//     }
//   }`

//   client.request(query).then(data => console.log(data))
// })()

export default {
  data: () => data,
  methods: {
    logOut: () => firebase.auth().signOut()
  }
}
</script>

<style scoped>
img.avatar {
  width: 80px;
  height: 80px;
}
</style>
