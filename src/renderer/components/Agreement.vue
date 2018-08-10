<template>
	<div>
    <nav class="p-2" style="background-color: rgb(255, 185, 1); border-bottom: 1px solid #ccc;">
      <div>
        <div>
          <img id="logo" src="~@/assets/img/logo.png" style="margin-top: 4px;">
        </div>
      </div>
    </nav>
    <div class="md:container p-4">
      <div class="bg-orange-lightest border-l-4 border-orange text-orange-dark p-4 mb-4">
        <span>
          {{ tokenName }} Wallet Terms & Conditions
        </span>
      </div>
      <div class="mt-4 w-full bg-grey-lighter rounded p-4 text-sm">
        <p class="font-bold mb-4">I understand that by using this wallet, I am responsible for the following items.</p>
        <p><i class="far fa-check-circle text-xs text-green mr-2 mb-2"></i>I am responsible for the safe storage of my recovery seed phrase.</p>
        <p><i class="far fa-check-circle text-xs text-green mr-2 mb-2"></i>I am responsible for my private key and will not share with anyone.</p>
        <p><i class="far fa-check-circle text-xs text-green mr-2 mb-2"></i>I am responsible for protecting my computer from malware that could compromise my wallet.</p>
        <p class="mt-4">I also understand this wallet is being used <span class="font-bold">as-is</span>, with no warranty or guarantee of support.</p>
        <p class="mt-4">{{ tokenName }} is not responsible for any loss of Ethereum (ETH) or {{ tokenName }} ({{ tokenTicker }}) by using this wallet.</p>
      </div>
      <div class="flex justify-center mt-4">
        <button 
          class="focus:outline-none bg-orange hover:bg-orange-dark text-white py-3 px-6 rounded" 
          type="button"
          @click="saveAgreement()"
        >I Accept this Agreement</button>
      </div>
    </div>
	</div>
</template>

<script>
  import env from './../common/Environment';

  export default {
  	name: 'Create',
  	props: [],

  	data() {
  		return {
        tokenTicker: env.tokenTicker,
        tokenName: env.tokenName,
      }
  	},

  	mounted() {},

  	methods: {
      saveAgreement: function () {
        localStorage.setItem('agreement', 'accepted');
        this.$router.push('Create');
      }
  	}
  }
</script>
