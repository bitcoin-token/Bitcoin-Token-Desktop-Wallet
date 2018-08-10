<template>
	<div class="h-screen bg-grey-lighter">
    <wallet-header :walletAddress="walletAddress"></wallet-header>

    <div class="flex items-center justify-between px-6 py-4 border-b border-grey-light bg-white">
      <div>
        1 ETH = {{ ethPrice }} USD
      </div>
      <div class="flex items-center">
        <div class="mr-12">
          <p class="text-xs text-center uppercase leading-normal">Balance</p> 
          <p class="text-lg leading-none">{{ ethBalance }} ETH</p>
        </div>
        <div>
          <p class="text-xs text-center uppercase leading-normal">Value</p> 
          <p class="text-lg leading-none">${{ ethValue }} USD</p>
        </div>
      </div>
    </div>
    <div class="px-3 mt-3">
      <div class="rounded-lg bg-white shadow">
        <div class="flex justify-between py-3 border-b border-grey-light">
          <h3 class="pl-3 mt-1">ETH Transactions</h3>
          <button type="button" class="focus:outline-none bg-grey-lighter hover:bg-grey-light text-grey-darker py-2 px-4 rounded mr-3" @click="getCompletedTxs()">
            <i class="fa fa-sync-alt text-md" :class="refreshing ? 'fa-spin' : ''"></i>
          </button>
        </div>

        <p v-if="completedTxs.length == 0" class="text-sm p-2" style="height: 325px;">
          There are no transactions to show for this address.
        </p>

        <div class="overflow-y-scroll" style="height: 330px;" v-if="completedTxs.length > 0">
          <table class="w-full table-auto cursor-pointer">
            <tr class="bg-grey-lighter border-b border-grey-light">
              <th class="py-4"></th>
              <th class="text-xs text-left font-semibold uppercase">Amount</th>
              <th class="text-xs text-left font-semibold uppercase">Date</th>
              <th class="text-xs text-left font-semibold uppercase">TxHash</th>
            </tr>
            <tr class="border-b border-grey-lighter text-grey bg-white" v-for="pendingTx in pendingTxs" @click="open(pendingTx.key)">
              <td width="40" height="50" class="px-2" style="vertical-align: middle;">
                <i class="pt-1 pl-1 fas fa-spin fa-circle-notch"></i>
              </td>
              <td>Pending</td>
              <td>
                --
              </td>
              <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 25px;">
                {{ pendingTx.key }}
              </td>
            </tr>
            <tr class="border-b border-grey-lighter text-grey-darker bg-white" v-for="transaction in completedTxs" @click="open(transaction.key)">
              <td width="40" height="50" class="px-2" style="vertical-align: middle;">
                <span :style="transaction.from != walletAddress ? 'color: green' : ''">
                  <i class="text-lg pt-1 pl-1 far" :class="getTxIcon(transaction.from)"></i>
                </span>
              </td>
              <td>
                <span :style="transaction.from != walletAddress ? 'color: green' : ''">{{ formatAmount(transaction.amount) }}</span>
              </td>
              <td>{{ formatTimestamp(transaction.timestamp) }}</td>
              <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 25px;">
                {{ transaction.key }}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
	</div>
</template>

<script>
  import WalletHeader from './WalletHeader'
  import env from './../common/Environment';
  import utils from './../common/Utilities';
  import _ from 'lodash';
  import Web3 from 'web3';
  import axios from 'axios';

  const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/' + env.infuraApiKey));

  export default {
  	name: 'Wallet',
    components: { WalletHeader },
    props: [],

  	data() {
  		return {
        walletAddress: '',
  			ethPrice: '0.00',
        ethBalance: '0',
        ethValue: '0.00',
        completedTxs: [],
        pendingTxs: [],
        refreshing: false
  		}
  	},

  	mounted() {
      this.hasWalletAddress();
  	},

  	methods: {
      hasWalletAddress: async function () {
        const walletAddress = await localStorage.getItem('walletAddress');
        
        if(!walletAddress) {
          this.$router.push('Create');
        } else {
          this.walletAddress = JSON.parse(walletAddress).toString();
          this.getStorageValues();
        }
      },

      getStorageValues: async function () {
        let ethPrice      = await localStorage.getItem('ethPrice');
        let ethBalance    = await localStorage.getItem('ethBalance');
        let pendingTxs    = await localStorage.getItem('ethPendingTxs');
        let completedTxs  = await localStorage.getItem('ethCompletedTxs');

        this.ethPrice     = ethPrice != null ? parseFloat(ethPrice) : '0.00';
        this.ethBalance   = ethBalance != null ? parseFloat(ethBalance) : '0';
        this.pendingTxs   = pendingTxs != null ? JSON.parse(pendingTxs) : [];
        this.completedTxs = completedTxs != null ? JSON.parse(completedTxs) : [];

        this.getEthPrice();
        this.getEthBalance();
        this.getCompletedTxs();
      },

      getEthPrice: function () {
        axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
          .then(response => {
            if(response.data.USD != undefined) {
              localStorage.setItem('ethPrice', JSON.parse(response.data.USD).toString());
              
              this.ethPrice = response.data.USD;
            }
          }).catch(error => {console.log(error)});
      },

      getEthBalance: function () {
        web3.eth.getBalance(this.walletAddress, (error, balance) => {
          if(balance) {
            let ethBalance = web3.utils.fromWei(balance, 'ether');
            let ethValue = ethBalance * this.ethPrice;

            this.ethBalance = ethBalance;
            this.ethValue = utils.format(ethValue, 2);

            localStorage.setItem('ethBalance', ethBalance.toString());
          }
        });
      },

      getCompletedTxs: function () {
        this.refreshing = true;

        let pendingTxs = [];

        axios.get('https://api.blockcypher.com/v1/eth/main/addrs/' + this.walletAddress)
          .then(response => {
            let listTxs = _.uniqBy(response.data.txrefs, 'tx_hash');

            if(listTxs != undefined && listTxs.length > 0) {
              let lastTxTimestamp = 0;
              let completedTx;

              if(this.completedTxs.length > 0) {
                lastTxTimestamp = parseInt(this.completedTxs[0].timestamp);
              }

              let tempPending = Object.values(this.pendingTxs);
              for(var p = 0; p < tempPending.length; p++) {
                pendingTxs.push(tempPending[p].key);
              }

              for(var j = listTxs.length - 1; j >= 0; j--) {

                if(pendingTxs.includes(listTxs[j].tx_hash)) {
                  this.pendingTxs = this.pendingTxs.filter((tx) => {return tx.key != listTxs[j].tx_hash});

                  localStorage.setItem('ethPendingTxs', JSON.stringify(this.pendingTxs));
                }

                let txTimestamp = utils.getTimestamp(listTxs[j].confirmed);

                if(parseInt(txTimestamp) > lastTxTimestamp) {

                  completedTx = {
                    key: listTxs[j].tx_hash,
                    timestamp: txTimestamp.toString(),
                    from: listTxs[j].tx_output_n == '0' ? '0' : this.walletAddress,
                    amount: listTxs[j].value.toString()
                  };
                  
                  this.completedTxs = [completedTx].concat(this.completedTxs);

                  localStorage.setItem('ethCompletedTxs', JSON.stringify(this.completedTxs));
                  this.refreshing = false;
                } else {
                  this.refreshing = false;
                }
              }
            } else {
              this.refreshing = false;
            }
          }).catch(error => {console.log(error)});
      },

      formatTimestamp: function (timestamp) {
        return utils.formatTime(timestamp);
      },

      formatAmount: function (amount) {
        return web3.utils.fromWei(amount);
      },

      getTxIcon: function (from) {
        return from == this.walletAddress ? 'fa-arrow-alt-circle-up' : 'fa-arrow-alt-circle-down'
      },

      open: function (txHash) {
        const url = 'https://etherscan.io/tx/' + txHash;

        this.$electron.shell.openExternal(url);
      }
  	}
  }
</script>
