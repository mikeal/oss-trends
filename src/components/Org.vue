<template>
  <div class="org">
    <div class="loader" v-if="info.loading">
      <div class="loader-container">
        Loading Data from GitHub ({{info.loading.percent}}%)...
      </div>
    </div>
    <div class="info" v-if="info.repos && info.repos.length"
         v-bind:style="{filter: info.loading ? 'blur(5px)' : 'none'}"
         >
      <ReposChart :repos="info.repos">
      </ReposChart>
      <ReposStats :repos="info.repos">
      </ReposStats>
    </div>
  </div>
</template>

<script>
import ReposStats from './github/ReposStats'
import ReposChart from './github/ReposChart'
import { loadOrg } from '../database'

export default {
  data: config => {
    let org = config.$route.params.org
    let info = loadOrg(org)
    return { org, info }
  },
  components: {ReposStats, ReposChart}
}
</script>
<style scoped>
div.info {
  width: 100%;
}
div.loader {
  position: absolute;
  top: 0;
  left: 0;
}
div.loader div.loader-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  width: 100vw;
  align-items: center;
}
</style>
