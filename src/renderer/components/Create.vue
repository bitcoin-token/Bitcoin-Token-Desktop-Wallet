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
        <span v-if="restore">
          Please type your recovery seed phrase in the bpx below. You must type it exactly as it was originally presented to you.
          It will be all lowercase and should have a total of 12 individual words.
        </span>
        <span v-else>
          This is your recovery seed phrase. It is used to generate the address of your wallet. Please write this down on paper and
          keep in a safe place. If you lose this phrase you will not be able to restore your account or your current balances.
        </span>
      </div>
      <form role="form">
        <div>
          <div class="flex justify-between">
            <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Seed Phrase</label>
            <div class="flex">
              <a 
                href="#" 
                class="block uppercase tracking-wide text-blue text-xs font-bold mb-2 no-underline hover:text-blue-dark"
                id="seed" 
                :data-clipboard-text="seedPhrase"
                @click="setCopied()"
                v-if="!restore"
              >Copy Seed to clipboard</a>
              <i class="ml-2 pt-1 text-xs text-blue fas fa-check-double" v-if="copied"></i>
            </div>
          </div>
          <textarea 
            class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight lowercase text-2xl  focus:outline-none focus:border-grey-light" 
            rows="2" 
            v-model="seedPhrase"
          ></textarea>
        </div>
        <div>
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Set Wallet Password</label>
          <input 
            type="password" 
            class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-grey-light" 
            v-model="password"
            placeholder="Password" 
          >
        </div>
        <div>
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Confirm Wallet Password</label>
          <input 
            type="password" 
            class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-grey-light" 
            v-model="confirmPassword"
            placeholder="Confirm Password" 
          >
        </div>
        <div class="flex justify-between mt-4">
          <button type="button" class="focus:outline-none bg-orange hover:bg-orange-dark text-white py-3 px-6 rounded" @click="generateWallet">
            <span v-if="restore">Restore Wallet</span>
            <span v-else>Create Wallet</span>
          </button>
          <a 
            href="#" 
            class="bg-red-lightest border border-red-light text-red-dark py-3 px-6 rounded no-underline" 
            v-if="goBack === true"
            @click="$router.push('Settings');"
          >Cancel</a>
        </div>
      </form>
    </div>
	</div>
</template>

<script>
  import env from './../common/Environment';
  import ClipboardJS from 'clipboard';
  import {keystore} from 'eth-lightwallet';
  import Web3 from 'web3';
  import {AES} from 'crypto-js';

  new ClipboardJS('#seed');

  const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/' + env.infuraApiKey));

  export default {
  	name: 'Create',
  	props: ['goBack', 'restore'],

  	data() {
  		return {
        password: '',
        confirmPassword: '',
        seedPhrase: '',
        firstVisit: false,
        copied: false
  		}
  	},

  	mounted() {
      this.hasAcceptedAgreement();
    },

  	methods: {
      hasAcceptedAgreement: async function () {
        const agreement = await localStorage.getItem('agreement');
        
        if(agreement !== 'accepted') {
          this.$router.push('Agreement');
        } else {
          this.generateSeedPhrase();
        }
      },

      generateSeedPhrase: function () {
        const mnemonic = keystore.generateRandomSeed(this.generateEntropy(256));

        if(this.restore != true) {
          this.seedPhrase = mnemonic;
        }
      },

      generateEntropy: function (length) {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = '';
        let values = new Uint32Array(length);

        window.crypto.getRandomValues(values);

        for(let i = 0; i < length; i++)
        {
          result += charset[values[i] % charset.length];
        }

        return result;
      },

      setCopied: function () {
        this.copied = true;
      },

      clearStorage: function () {
        localStorage.removeItem('seedEncrypted');
        localStorage.removeItem('passwordEncrypted');
        localStorage.removeItem('ethPendingTxs');
        localStorage.removeItem('tokenPendingTxs');
        localStorage.removeItem('ethCompletedTxs');
        localStorage.removeItem('tokenCompletedTxs');
      },

      generateWallet: function () {
        if(this.seedPhrase != '' && this.password != '' && this.confirmPassword != '') {
          if(this.password == this.confirmPassword) {
            if(keystore.isSeedValid(this.seedPhrase)) {
              
              this.clearStorage();

              keystore.createVault({
                password: this.password,
                seedPhrase: this.seedPhrase,
                hdPathString: "m/44'/60'/0'/0"
              }, (error, ks) => {
                if(error) {
                  alert('There was a problem initiating a keystore. Please re-install the application.');
                  return;
                } else {
                  localStorage.setItem('seedEncrypted', AES.encrypt(this.seedPhrase, this.password).toString());
                  localStorage.setItem('passwordEncrypted', web3.utils.sha3(this.password).toString());

                  ks.keyFromPassword(this.password, (error, pwDerivedKey) => {
                    if(error) {
                      alert('There was a problem initiating a keystore. Please re-install the application.');
                      return;
                    } else {
                      ks.generateNewAddress(pwDerivedKey, 1);

                      localStorage.setItem('walletAddress', JSON.stringify(ks.getAddresses()));

                      alert('Your wallet has been successfully created.');

                      this.$router.push('Wallet');
                    }
                  });
                }
              });
            } else {
              alert('Invalid seed phrase.');
              return;
            }
          } else {
            alert('Password confirmation failed.');
            return;
          }
        } else {
          alert('There are missing fields.');
          return;
        }
      }

  	}
  }
</script>
