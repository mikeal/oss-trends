const firebase = require('firebase')

var config = {
  apiKey: 'AIzaSyA7KHCPkwMSDrGYU_7UbB-k9Jd9FmRfwpE',
  authDomain: 'erudite-carving-203019.firebaseapp.com',
  databaseURL: 'https://erudite-carving-203019.firebaseio.com',
  projectId: 'erudite-carving-203019',
  storageBucket: '',
  messagingSenderId: '426929737498'
}
firebase.initializeApp(config)

module.exports = firebase
