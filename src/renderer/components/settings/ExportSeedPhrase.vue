<template>
	<div class="h-screen bg-grey-lighter">

		<wallet-header :walletAddress="walletAddress"></wallet-header>

    <div class="flex p-4">
      <div class="flex flex-col w-1/4">
        <button-menu :walletAddress="walletAddress"></button-menu>
      </div>
      <div class="w-3/4 flex-no-grow pl-4">
        <div class="bg-white rounded border border-grey-light px-4 pt-2 pb-6 mb-4">
          <div class="text-grey-darker font-bold text-sm border-b border-grey-light pb-1">Settings: Export Seed Phrase</div>
          <div class="mt-4">
            <label class="block text-grey-darker text-xs font-bold mb-2">Account Password</label>
            <div class="flex items-center mb-4">
              <input 
                type="password" 
                class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none  focus:outline-none focus:border-grey-light"
                v-model="password"
                placeholder="Password" 
              >
              <button 
                type="button" 
                class="flex-no-shrink focus:outline-none bg-orange hover:bg-orange-dark border border-orange text-white rounded py-3 px-5 mb-3 ml-4"
                @click="getSeedPhrase()"
              >Export Seed</button>
            </div>
            <div class="w-full bg-grey-lighter rounded p-4 h-32 break-words">
              {{ seedPhrase }}
            </div>
          </div> 
        </div>
      </div>
    </div>
	</div>
</template>

<script>
  import WalletHeader from './../WalletHeader';
  import ButtonMenu from './ButtonMenu';
  import walletKeystore from './../../common/Keystore';
  import env from './../../common/Environment';
  import Web3 from 'web3';
  import {AES} from 'crypto-js';

  const web3 = new Web3();

  export default {
  	name: 'ExportSeedPhrase',
    components: { WalletHeader, ButtonMenu },
  	props: ['walletAddress'],

  	data() {
  		return {
        password: '',
        seedPhrase: ''
  		}
  	},

  	methods: {
      getSeedPhrase: async function () {
        const storedPassword = await localStorage.getItem('passwordEncrypted');

        if(web3.utils.sha3(this.password) != storedPassword) {
          alert('Invalid Password');
          return;
        }

        walletKeystore.getSeedPhrase(this.password, (seedPhrase) => {
          this.seedPhrase = seedPhrase;
        });
      }
  	}
  }
</script>
