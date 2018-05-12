<template>
  <div class="month">

  </div>
</template>

<script>
import Vue from 'vue'
const Papa = require('papaparse')

export default {
  data: config => {
    // let {month, year} = config.$route.params
    let url = `https://firebasestorage.googleapis.com/v0/b/erudite-carving-203019.appspot.com/o/2018-04-language-summary.csv?alt=media&token=8fb3f804-d093-468f-9f7e-aedf561b4a2b`
    console.log(url)
    let data = {loading: true, csv: null}
    Papa.parse(url, {
      download: true,
      header: true,
      complete: results => {
        console.log(results)
        Vue.set(data, 'csv', results)
      }
    })
    return data
  },
  components: { }
}
</script>

<style scoped>
</style>
