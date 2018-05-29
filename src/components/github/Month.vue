<template>
  <div class="month">
    <div class="month-breakdown" v-if="chartData">
      <div class="chart-container">
        <pie-chart :chartData="chartData"></pie-chart>
      </div>
      <div class="chart-config">
        <div class="chart-config-header">
          <div class="lang">Event</div>
          <div>Share</div>
          <div>Events</div>
        </div>
        <div class="chart-config-row"
             v-for="event in month.allEvents"
             :key="event"
             :show="month.events.includes(event) || showallEvents"
            >
          <div class="event-name lang">
            <input
            type="checkbox"
            :id="event"
            :value="event"
            :checked="month.events.includes(event)"
            v-model="month.events" />
            {{event}}
          </div>
          <div>{{
            Math.round((month.eventShare[event] / month.eventTotal) * 100)
          }}%</div>
          <div>{{month.eventShare[event]}}</div>
        </div>
        <button v-if="month.events.length !== month.allEvents.length" v-on:click="showallEvents = true">more</button>
      </div>
      <div class="chart-config">
        <div class="chart-config-header">
          <div class="lang">Language</div>
          <div class="ev-header" v-for="event in month.events" :key="event">{{event}}</div>
        </div>
        <div class="chart-config-row"
             v-for="lang in month.allLanguages"
             :key="lang"
             :show="month.languages.includes(lang) || showall"
            >
          <div class="lang">
            <input
            type="checkbox"
            :id="lang"
            :value="lang"
            :checked="month.languages.includes(lang)"
            v-model="month.languages" />

            <div class="color-box"
                 v-bind:style="{ 'background-color': month.colors[lang] }"></div>
            {{lang}}
          </div>
          <div v-for="event in month.events" :key="event">
            {{month.alldata[lang][event]}}
          </div>
        </div>
        <button v-on:click="showall = true">more</button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import toColor from 'string-to-color'
const Papa = require('papaparse')

const getChartData = month => {
  let data = {}
  month.csv.data.forEach(o => {
    if (month.languages.includes(o.Language) &&
        month.events.includes(o.EventType)) {
      if (!data[o.Language]) data[o.Language] = 0
      data[o.Language] += o.Count
    }
  })

  let total = Object.values(data).reduce((x, y) => x + y, 0)

  let labels = month.languages.map(k => {
    return `${k}(${Math.round((data[k] / total) * 100)}%)`
  })

  let datasets = [{
    label: `events`,
    data: Object.values(data),
    backgroundColor: Object.keys(data).map(k => month.colors[k])
  }]

  return {labels, datasets}
}

export default {
  methods: {toColor},
  data: config => {
    // let {month, year} = config.$route.params
    let url = `https://firebasestorage.googleapis.com/v0/b/erudite-carving-203019.appspot.com/o/2018-04-language-summary.csv?alt=media&token=8fb3f804-d093-468f-9f7e-aedf561b4a2b`
    let data = {
      month: null,
      chartData: null,
      showall: false,
      showallEvents: false
    }
    Papa.parse(url, {
      download: true,
      header: true,
      complete: results => {
        results.data = results.data.filter(d => d.Language.length)
        let eventShare = {}
        let alldata = {}
        results.data.forEach(o => {
          if (typeof o.Count === 'undefined') {
            console.log(o)
          }
          o.Count = parseInt(o.Count)
          if (!eventShare[o.EventType]) eventShare[o.EventType] = 0
          eventShare[o.EventType] += o.Count

          if (!alldata[o.Language]) alldata[o.Language] = {}
          alldata[o.Language][o.EventType] = o.Count
        })

        let totalEvents = 0
        let share = {}
        results.data.forEach(o => {
          if (!share[o.Language]) share[o.Language] = 0
          share[o.Language] += o.Count
          totalEvents += o.Count
        })

        Object.keys(share).forEach(key => {
          share[key] = Math.round((share[key] / totalEvents) * 100)
        })

        let compress = k => {
          let arr = results.data.filter(x => share[x.Language])
          return Array.from(new Set(arr.map(x => x[k])))
        }
        let allLanguages = Object.keys(share).sort((a, b) => {
          if (share[a] > share[b]) return -1
          if (share[a] < share[b]) return 1
          return 0
        })
        let languages = allLanguages.filter(k => share[k]).slice(0, 15)

        let colors = {}
        allLanguages.forEach(l => { colors[l] = toColor(l) })
        let events = compress('EventType').sort((a, b) => {
          if (eventShare[a] > eventShare[b]) return -1
          if (eventShare[a] < eventShare[b]) return 1
          return 0
        })

        Vue.set(data, 'month', {
          csv: results,
          share,
          allLanguages,
          languages,
          colors,
          events,
          eventShare,
          alldata,
          eventTotal: Object.values(eventShare).reduce((x, y) => x + y, 0),
          allEvents: events.slice(0),
          totalEvents
        })
      }
    })
    return data
  },
  watch: {
    month: function () {
      Vue.set(this.$data, 'chartData', getChartData(this.$data.month))
    },
    'month.languages': function () {
      Vue.set(this.$data, 'chartData', getChartData(this.$data.month))
    },
    'month.events': function () {
      Vue.set(this.$data, 'chartData', getChartData(this.$data.month))
    }
  }
}
</script>

<style scoped>
/* div.month-breakdown {
  width: 500px;
} */
div.month-breakdown {
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}
div.month-breakdown div.chart-container, div.month-breakdown div.chart-config {
  margin: 10px 10px 10px 10px;
}
div.chart-container {
  min-width: 200px;
  min-height: 200px;
  max-width: 300px;
  max-height: 300px;
}
div.chart-config {
  display: table;
  min-width: 100px;
  border-right: 1px solid gainsboro;
}
div.chart-config-header .lang {
  padding-left: 22px;
  font-weight: bold;
}
div.chart-config-header *:not(.lang) {
  font-weight: bold;
  border-left: 1px solid gainsboro;
  border-top: 1px solid gainsboro;
}
div.chart-config-header, div.chart-config-row {
  display: table-row;
}
div.chart-config-header * {
  display: table-cell;
  border-bottom: 1px solid gainsboro;
}
div.chart-config-row * {
  display: table-cell;
  border-bottom: 1px solid gainsboro;
  border-left: 1px solid gainsboro;
}
div.chart-config-header:nth-child(even),
div.chart-config-row:nth-child(odd){
  background-color: gainsboro;
}
div.chart-config-row:not([show=true]) {
  display: none;
}
div.color-box {
  width: 10px;
  height: 10px;
  display: inline-block;
  background-color: #ccc;
}
div.lang {
  text-align: left;
}
div.ev-header {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60px;
}
</style>
