<template>
  <nav class="flex items-center justify-between p-2 border-b border-grey" style="background-color: rgb(255, 185, 1);">
    <div class="flex items-center flex-no-shrink text-white mr-6">
        <img id="logo" src="~@/assets/img/logo.png" style="margin-top: 4px;">
    </div>
    <div class="w-full block flex-grow flex items-center w-auto">
      <div class="text-sm flex-grow">
        <a href="#" class="block inline-block mt-0 text-black hover:text-white mr-6 no-underline" @click="navigate('Wallet')">
          <i class="fa fa-bars"></i>
          {{ tokenTicker }} Summary
        </a>
        <a href="#" class="block inline-block mt-0 text-black hover:text-white mr-6 no-underline" @click="navigate('EthWallet')">
          <i class="fa fa-bars"></i>
          ETH Summary
        </a>
        <a href="#" class="block inline-block mt-0 text-black hover:text-white mr-6 no-underline" @click="navigate('Receive')">
          <i class="fa fa-arrow-down"></i>
          Receive
        </a>
        <a href="#" class="block inline-block mt-0 text-black hover:text-white no-underline" @click="navigate('Send')">
          <i class="fa fa-arrow-up"></i>
          Send
        </a>
      </div>
    </div>
    <div class="flex justify-content">
      <a 
        href="#" 
        class="inline-block text-sm px-4 py-2 mr-2 leading-none border rounded text-black border-black hover:border-transparent hover:text-grey hover:bg-white no-underline" 
        @click="navigate('Settings')"
      >
        <i class="fa fa-cog"></i>
      </a>
    </div>
  </nav>
</template>

<script>
  import env from './../common/Environment';

	export default {
		props: ['walletAddress'],

		data() {
			return {
        tokenTicker: env.tokenTicker,
        tokenName: env.tokenName,
			}
		},

		methods: {
			navigate: function (destination) {
				this.$router.push({name: destination, params: {walletAddress: this.walletAddress}});
			}
		}
	}
</script>