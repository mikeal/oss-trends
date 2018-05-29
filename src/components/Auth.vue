<template lang="html">
  <div id="firebaseui-auth-container"></div>
</template>

<script>
import firebaseui from 'firebaseui'
const firebase = require('../firebase')

export default {
  name: 'auth',
  mounted: () => {
    let uiConfig = {
      signInSuccessUrl: '/success',
      signInOptions: [
        { provider: firebase.auth.GithubAuthProvider.PROVIDER_ID }
      ],
      callbacks: {
        signInSuccess: (user, credential, redirect) => {
          localStorage.githubToken = credential.accessToken
        }
      }
    }
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
  }
}
</script>
