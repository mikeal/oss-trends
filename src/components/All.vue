<template>
  <div id="all-okrs">
    <div id="repo" v-for="repo in repos" :key="repo">
      <Quarter :repo=repo></Quarter>
    </div>
  </div>
</template>

<script>
import Quarter from './Quarter'

const repos = [
  'ipfs/community'
]

// github.query(query)

export default {
  name: 'all-okrs',
  components: {Quarter},
  data: () => ({repos})
}
</script>

<style scoped=true>
</style>
