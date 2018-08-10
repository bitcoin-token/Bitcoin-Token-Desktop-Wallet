<template>
	<div class="h-screen bg-grey-lighter">

		<wallet-header :walletAddress="walletAddress"></wallet-header>

    <div class="flex p-4">
      <div class="flex flex-col w-1/4">
        <button-menu :walletAddress="walletAddress"></button-menu>
      </div>
      <div class="w-3/4 flex-no-grow pl-4">
        <div class="bg-white rounded border border-grey-light px-4 pt-2 pb-6 mb-4">
          <div class="text-grey-darker font-bold text-sm border-b border-grey-light pb-1">Settings: Change Password</div>
          <div class="mt-4">
            <label class="block text-grey-darker text-xs font-bold mb-2">Current Password</label>
            <input 
              type="password" 
              class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-grey-light"
              v-model="password"
            >
          </div> 
          <div class="mt-4">
            <label class="block text-grey-darker text-xs font-bold mb-2">New Password</label>
            <input 
              type="password" 
              class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-grey-light"
              v-model="newPassword"
            >
          </div>
          <div class="mt-4">
            <label class="block text-grey-darker text-xs font-bold mb-2">Confirm New Password</label>
            <input 
              type="password" 
              class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-grey-light"
              v-model="confirmNewPassword"
            >
          </div>
          <div class="mt-4">
            <button 
              type="button" 
              class="focus:outline-none bg-orange hover:bg-orange-dark text-white py-3 px-6 rounded"
              style="margin-top: 5px;" 
              @click="changePassword()"
            >Update
            </button>
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

  const web3 = new Web3();

  export default {
  	name: 'ChangePassword',
    components: { WalletHeader, ButtonMenu },
  	props: ['walletAddress'],

  	data() {
  		return {
        password: '',
        newPassword: '',
        confirmNewPassword: ''
  		}
  	},

  	methods: {
      changePassword: async function () {
        const storedPassword = await localStorage.getItem('passwordEncrypted');

        if(web3.utils.sha3(this.password) != storedPassword) {
          alert('Invalid Password');
          return;
        }

        if(this.newPassword == this.confirmNewPassword) {
          walletKeystore.getSeedPhrase(this.password, (seedPhrase) => {

            localStorage.setItem('seedEncrypted', AES.encrypt(seedPhrase, this.newPassword).toString());
            localStorage.setItem("passwordEncrypted", web3.utils.sha3(this.newPassword));

            alert('Password change complete');

            this.$router.push('Wallet');

          });
        } else {
          alert('Password confirmation failed.');
        }
      }
  	}
  }
</script>
