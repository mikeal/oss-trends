<template>
  <div id="quarter-okrs">
    <div class="okrs" v-if="okrs">
      <!-- <thead>
        <tr>
          <th>Key Result</th>
          <th>Owner</th>
          <th v-if="okrs[0].krs[0].length">Mid-Q</th>
          <th v-if="okrs[0].krs[0].length > 1">Projection</th>
          <th v-if="okrs[0].krs[0].length > 2">Final</th>
        </tr>
      </thead> -->

    <!-- MOVE ALL THIS SHIT TO CSS GRID, FUCK TACHYONS -->

      <div>
        <div class="fl w-100 items-start v-mid" v-for="okr in okrs" :key=okr.objective>
          <div class="objective fl w-100">{{okr.objective}}</div>
          <div class="fl w-100 v-mid" v-for="kr in okr.krs" :key=kr.kr>
            <div class="kr-title v-mid">
              <p class="key-result fl w-70  v-mid" v-html="kr.kr"></p>
              <p class="fl w-10 v-mid">{{kr.owner}}</p>
              <p class="fl w-5 v-mid" v-for="(score, index) in kr.scoring" :key="kr.kr + index">{{score}}</p>
            </div>
            <div v-for="(event, index) in kr.activity"
                class="activity fl w-100"
                :key=index>
              <div class="fl w-20">
                <div v-if="event.author">
                  <span>{{event._type}}</span>
                  <img class="avatar" :src="event.author.avatarUrl"/>
                  <a v-if="event.actorLink"
                     :href="event.actorLink">
                    @{{event.author.login}}
                  </a>
                </div>
              </div>
              <timeago class="fl w-20" :datetime="event.createdAt"></timeago>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div v-else>
      Loading
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import github from '../github'
const marked = require('marked')

const repos = [
  'ipfs/community'
]

// github.query(query)

const allTypesForQuery = `
... on AssignedEvent {
  actor {
    login,
    avatarUrl
  }
  AssignedEvent: id,
  createdAt
}
... on ClosedEvent {
  actor {
    login,
    avatarUrl
  }
  ClosedEvent: id,
  createdAt
}
... on Commit {
  author {
    email,
    avatarUrl
  }
  Commit: id,
  pushedDate
}
... on CrossReferencedEvent {
  actor {
    login,
    avatarUrl
  }
  CrossReferencedEvent: id,
  createdAt
}
... on DemilestonedEvent {
  actor {
    login,
    avatarUrl
  }
  DemilestonedEvent: id,
  createdAt
}
... on IssueComment {
  author {
    login,
    avatarUrl
  }
  url,
  IssueComment: id,
  createdAt
}
... on LabeledEvent {
  actor {
    login,
    avatarUrl
  }
  LabeledEvent: id,
  createdAt
}
... on LockedEvent {
  actor {
    login,
    avatarUrl
  }
  LockedEvent: id,
  createdAt
}
... on MilestonedEvent {
  actor {
    login,
    avatarUrl
  }
  MilestonedEvent: id,
  createdAt
}
... on ReferencedEvent {
  actor {
    login,
    avatarUrl
  }
  ReferencedEvent: id,
  createdAt
}
... on RenamedTitleEvent {
  actor {
    login,
    avatarUrl
  }
  RenamedTitleEvent: id,
  createdAt
}
... on ReopenedEvent {
  actor {
    login,
    avatarUrl
  }
  ReopenedEvent: id,
  createdAt
}
... on SubscribedEvent {
  actor {
    login,
    avatarUrl
  }
  SubscribedEvent: id,
  createdAt
}
... on UnassignedEvent {
  actor {
    login,
    avatarUrl
  }
  UnassignedEvent: id,
  createdAt
}
... on UnlabeledEvent {
  actor {
    login,
    avatarUrl
  }
  UnlabeledEvent: id,
  createdAt
}
... on UnlockedEvent {
  actor {
    login,
    avatarUrl
  }
  UnlockedEvent: id,
  createdAt
}
... on UnsubscribedEvent {
  actor {
    login,
    avatarUrl
  }
  UnsubscribedEvent: id,
  createdAt
}
`

const extractLink = html => {
  var div = document.createElement('div')
  div.innerHTML = html
  return div.firstChild.firstChild.href
}

const fetchLink = async (link, activity) => {
  let u = new URL(link)
  if (u.hostname === 'github.com') {
    let [owner, name, , num] = u.pathname.split('/').filter(x => x)
    let query = `query {
      repository (owner: "${owner}", name: "${name}") {
        issueOrPullRequest (number: ${num}) {
          ... on PullRequest {
            timeline (first: 10) {
              nodes {
                ${allTypesForQuery}
              }
            }
          }
          ... on Issue {
            timeline (first: 10) {
              nodes {
                ${allTypesForQuery}
              }
            }
          }
        }
      }
    }
    `
    let result = await github.query(query)
    result.repository.issueOrPullRequest.timeline.nodes.forEach(node => {
      if (node) {
        let type
        if (node.Commit) {
          type = 'Commit'
        } else if (node.IssueComment) {
          type = 'IssueComment'
        } else {
          type = Object.keys(node).filter(k => k.endsWith('Event'))[0]
        }
        node.id = node[type]
        node._type = type
        if (node._type.endsWith('Event')) node._type = node._type.slice(0, node._type.length - 'Event'.length)
        if (node.author) {
          node.actorLink = `https://github.com/${node.author.login}`
        }
        if (node.actor) {
          node.actorLink = `https://github.com/${node.actor.login}`
          node.author = node.actor
        }

        activity.push(node)
      }
    })
  } else {
    console.log(`Link is not to github, skipping ${link}`)
  }
}

export default {
  name: 'quarter-okrs',
  data: () => ({okrs: null}),
  mounted: function () {
    const self = this
    ;(async () => {
      let repo = self.$attrs.repo
      let url = `https://api.github.com/repos/${repo}/contents/okrs/2019-q1.md`
      let r = await (await fetch(url)).json()
      let md = Buffer.from(r.content, 'base64').toString()
      const tokens = marked.lexer(md)

      let okrs = []
      let objective = null
      for (let token of tokens) {
        if (token.type === 'heading') {
          objective = token.text
        }
        if (token.type === 'table') {
          let krs = []
          for (let cell of token.cells) {
            let [kr, owner, ...scoring] = cell
            let link
            let activity = []
            if (kr[0] === '[') {
              kr = marked.parser(marked.lexer(kr))
              link = extractLink(kr)
              fetchLink(link, activity)
            } else {
              kr = `<p>${kr}</p>`
            }
            krs.push({kr, owner, scoring, link, activity})
          }
          okrs.push({objective, krs})
        }
      }
      self.$data.okrs = okrs
    })()
  }
}
</script>

<style scoped=true>
div.okrs {
  text-align: left;
}
img.avatar {
  width: 20px;
}
div.objective {
  font-size: 140%;
}
p.key-result {
  font-size: 120%;
}
div.kr-title * {
  height: 100%;
}
</style>
