<template>
  <div>
    <button class="w-full focus:outline-none bg-grey-light hover:bg-grey text-grey-darkest py-3 px-6 rounded text-xs outline-none mb-3" @click="navigate('ChangePassword')">
      Change Password
    </button>
    <button class="w-full focus:outline-none bg-grey-light hover:bg-grey text-grey-darkest py-3 px-6 rounded text-xs outline-none mb-3" @click="navigate('ExportPrivateKey')">
      Export Private Key
    </button>
    <button class="w-full focus:outline-none bg-grey-light hover:bg-grey text-grey-darkest py-3 px-6 rounded text-xs outline-none mb-3" @click="navigate('ExportSeedPhrase')">
      Export Seed Phrase
    </button>
    <button class="w-full focus:outline-none bg-grey-light hover:bg-grey text-grey-darkest py-3 px-6 rounded text-xs outline-none mb-3" @click="navigate('Create')">
      Create New Wallet
    </button>
    <button class="w-full focus:outline-none bg-grey-light hover:bg-grey text-grey-darkest py-3 px-6 rounded text-xs outline-none mb-3" @click="navigate('Create', true)">
      Restore Wallet
    </button>
  </div>
</template>

<script>
  export default {
  	props: ['walletAddress'],

  	data() {
  		return {}
  	},

  	methods: {
      navigate: function (destination, restore = false, goBack = true) {
        this.$router.push({name: destination, params: {walletAddress: this.walletAddress, restore: restore, goBack: goBack}});
      }
  	}
  }
</script>
