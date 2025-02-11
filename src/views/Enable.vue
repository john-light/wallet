<template>
  <div class="enable">
    <div class="popup-logo">
      <img :src="logo"/>
    </div>
    <div class="enable-screen wrapper">
      <h2 class="text-center">Connect Request</h2>

      <div class="enable-screen_icon mt-2 text-center">{{originShort}}</div>
      <p class="mt-1 mb-2 text-center">{{originDomain}}</p>
      <p class="mb-2">By granting permission to <strong>{{origin}}</strong>, they can read your public account addresses.</p>
      <p class="text-primary text-center mb-4">Make sure you trust this site</p>
      <div class="main-content">
      <div class="list-items">
        <NetworkAccounts @item-selected="onAccountSelected"
                         :search="search"
                         :account-id="accountId"
                         :accounts="accounts"/>
      </div>
    </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Deny</button>
          <button class="btn btn-primary btn-lg btn-icon"
                  id="connect_request_button"
                  @click="reply(true)"
                  :disabled="loading || !accountId">
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Connect</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import NetworkAccounts from '@/components/NetworkAccounts'

export default {
  components: {
    NetworkAccounts
  },
  data () {
    return {
      replied: false,
      loading: false,
      search: '',
      accountId: null
    }
  },
  computed: {
    ...mapGetters(['accountsData']),
    accounts () {
      return this.accountsData.filter(a => a.chain === this.chain)
    },
    logo () {
      return LogoWallet
    },
    origin () {
      return this.$route.query.origin
    },
    chain () {
      return this.$route.query.chain
    },
    originShort () {
      return this.originDomain[0].toUpperCase()
    },
    originDomain () {
      return (new URL(this.origin)).hostname
    },
    originIcon () {
      return `https://s2.googleusercontent.com/s2/favicons?domain_url=${this.origin}`
    }
  },
  methods: {
    ...mapActions(['replyOriginAccess']),
    reply (allowed) {
      this.replyOriginAccess({
        origin: this.origin,
        allowed,
        chain: this.chain,
        accountId: this.accountId
      })

      this.replied = true

      window.close()
    },
    onAccountSelected ({ account }) {
      this.accountId = account?.id
    }
  },
  beforeDestroy () {
    if (this.replied) return

    this.reply(false)
    this.accountId = null
  }
}
</script>

<style lang="scss">
.enable-screen {
  overflow-y: auto;
  overflow-x: hidden;
  &_icon {
    font-size: 40px;
    line-height: 74px;
    margin: 0 auto;
    color: white;
    width: 74px;
    height: 74px;
    background: #b6b6b6;
    border-radius: 50%;
  }
}

.enable {
  overflow-y: auto;
  overflow-x: hidden;

  .main-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .asset-list-header {
      display: flex;
      align-items: center;
      padding-left: 15px;
      padding-right: 15px;
      height: 70px;

      .input-group {
        align-items: center;
        height: 30px;

        input {
          padding-left: 20px;
        }

        svg {
          position: absolute;
          left: 0;
          top: 5px;
          width: 16px;
          margin-right: 8px;
        }
      }
    }

    .list-items {
      overflow-y: auto;
      padding-bottom: 80px;
    }
  }
}
</style>
