<template>
  <div class="timeline-chart">
    <div id="chart" v-if="chart">
      <div id="prim-lang-row">
      <line-chart
        :labels="chart.labels"
        :datasets="chart.datasets"
      ></line-chart>
    </div>
  </div>
</template>

<script>
</script>

<style>
</style>
