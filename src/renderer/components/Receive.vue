<template>
	<div class="h-screen bg-grey-lighter">
		
    <wallet-header :walletAddress="walletAddress"></wallet-header>

    <div class="flex justify-center">
      <div class="w-full max-w-md mt-8">
        <div class="bg-white shadow-md rounded px-8 pt-4 pb-6 mb-4">
          <div class="bg-orange-lightest border-l-4 border-orange text-orange-dark p-4" role="alert">
            <p>Only send Ethereum (ETH) or {{ tokenName }} ({{ tokenTicker }}) to this address.</p>
          </div>
          
          <div class="flex justify-center mt-6 mb-6">
            <img :src="qrcode" alt="QR Code">
          </div>

          <div class="inline-flex justify-center w-full">
            <span class="border border-grey-light text-grey-darkest font-bold py-4 px-8 rounded-l" id="address">
              {{ walletAddress }}
            </span>
            <button 
              class="focus:outline-none bg-grey-light hover:bg-grey text-grey-darkest font-bold py-2 px-6 rounded-r text-lg outline-none" 
              id="btn" 
              :data-clipboard-text="walletAddress" 
              @click="copy">
              <i :class="copyButton"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
	</div>
</template>

<script>
  import WalletHeader from './WalletHeader';
  import QRCode from 'qrcode';
  import ClipboardJS from 'clipboard';
  import env from './../common/Environment';

  new ClipboardJS('#btn');

  export default {
  	name: 'Receive',
    components: { WalletHeader },
  	props: ['walletAddress'],

  	data() {
  		return {
        tokenTicker: env.tokenTicker,
        tokenName: env.tokenName,
        qrcode: '',
        copyButton: 'far fa-clone'
  		}
  	},

  	mounted() {
      this.createQrCode();
  	},

  	methods: {
      createQrCode: function () {
        QRCode.toDataURL(this.walletAddress)
          .then(url => {
            this.qrcode = url;
          })
          .catch(err => {
            console.error(err)
          })
      },

      copy: function () {
        this.copyButton = 'fas fa-check-double';
      }
  	}
  }
</script>
