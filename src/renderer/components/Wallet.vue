<template>
	<div class="h-screen bg-grey-lighter">
    <wallet-header :walletAddress="walletAddress"></wallet-header>

    <div class="flex items-center justify-between px-6 py-4 border-b border-grey-light bg-white">
      <div>
        1 {{ tokenTicker }} = {{ tokenPrice }} USD
      </div>
      <div class="flex items-center">
        <div class="mr-12">
          <p class="text-xs text-center uppercase leading-normal">Balance</p> 
          <p class="text-lg leading-none">{{ tokenBalance }} {{ tokenTicker }}</p>
        </div>
        <div>
          <p class="text-xs text-center uppercase leading-normal">Value</p> 
          <p class="text-lg leading-none">${{ tokenValue }} USD</p>
        </div>
      </div>
    </div>
    <div class="px-3 mt-3">
      <div class="rounded-lg bg-white shadow">
        <div class="flex justify-between py-3 border-b border-grey-light">
          <h3 class="pl-3 mt-1">{{ tokenTicker }} Transactions</h3>
          <button type="button" class="focus:outline-none bg-grey-lighter hover:bg-grey-light text-grey-darker py-2 px-4 rounded mr-3" @click="updateWallet()">
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
              <td width="40" height="50" class="px-2">
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
  import WalletHeader from './WalletHeader';
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
        tokenTicker: env.tokenTicker,
        tokenName: env.tokenName,
        walletAddress: '',
  			tokenPrice: '0.00',
        tokenBalance: '0',
        tokenValue: '0.00',
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
        let tokenPrice    = await localStorage.getItem('tokenPrice');
        let tokenBalance  = await localStorage.getItem('tokenBalance');
        let pendingTxs    = await localStorage.getItem('tokenPendingTxs');
        let completedTxs  = await localStorage.getItem('tokenCompletedTxs');

        this.tokenPrice   = tokenPrice != null ? parseFloat(tokenPrice) : '0.00';
        this.tokenBalance = tokenBalance != null ? parseFloat(tokenBalance) : '0';
        this.pendingTxs   = pendingTxs != null ? JSON.parse(pendingTxs) : [];
        this.completedTxs = completedTxs != null ? JSON.parse(completedTxs) : [];

        this.updateWallet();
      },

      updateWallet: function () {
        this.getTokenPrice();
        this.getTokenBalance();
        this.getCompletedTxs();
      },

      getTokenPrice: function () {
        /*
        axios.get('https://coinlib.io/api/v1/coin?key=' + env.coinlibApiKey + '&pref=USD&symbol=' + env.tokenTicker)
          .then(response => {
            if(response.data.price != undefined) {
              localStorage.setItem('tokenPrice', JSON.parse(response.data.price).toString());
              this.tokenPrice = response.data.price;
            }
          }).catch(error => {console.log(error)});
          */
        axios.get('https://btk.community/api/cmc.php')
          .then(response => {
            if(response.data.USD != undefined) {
              localStorage.setItem('tokenPrice', JSON.parse(response.data.USD).toString());
              this.tokenPrice = response.data.USD
            }
          }).catch(error => {console.log(error)});
      },

      getTokenBalance: function () {
        web3.eth.call({
          to: env.contractAddress,
          data: '0x70a08231000000000000000000000000' + this.walletAddress.substring(2)
        }, (error, balance) => {
          if(balance) {
            let tokenBalance = web3.utils.fromWei(web3.utils.toBN(balance).toString(), 'ether'); 
            let tokenValue = tokenBalance * this.tokenPrice;

            this.tokenBalance = tokenBalance;
            this.tokenValue = utils.format(tokenValue, 2);

            localStorage.setItem('tokenBalance', tokenBalance.toString());
          }
        });
      },

      getCompletedTxs: function () {
        this.refreshing = true;

        let pendingTxs = [];

        web3.eth.getBlockNumber()
          .then(async response => {
            let listTxs = [];
            let fromBlock = 0;

            if(this.completedTxs.length != null) {
              fromBlock = response - 86000;
            }
            
            let contract = new web3.eth.Contract(env.abi, env.contractAddress);

            let toTxs = await contract.getPastEvents('Transfer', { filter: {_to: this.walletAddress}, fromBlock: fromBlock, toBlock: 'latest'});
            if(toTxs.length > 0) {
              toTxs = _.uniqBy(toTxs, 'transactionHash');
              for(let i = 0; i < toTxs.length; i++) {
                listTxs.push(toTxs[i]);
              }
            }

            let fromTxs = await contract.getPastEvents('Transfer', { filter: {_from: this.walletAddress}, fromBlock: fromBlock, toBlock: 'latest'});
            if(fromTxs.length > 0) {
              fromTxs = _.uniqBy(fromTxs, 'transactionHash');
              for(let j = 0; j < fromTxs.length; j++) {
                listTxs.push(fromTxs[j]);
              }
            }

            listTxs.sort((a, b) => {
              return parseInt(a.blockNumber) - parseInt(b.blockNumber);
            });

            if(listTxs.length > 0) {
              let lastTxTimestamp = 0;
              let completedTx;

              if(this.completedTxs.length > 0) {
                lastTxTimestamp = parseInt(this.completedTxs[0].timestamp);
              }

              let tempPending = Object.values(this.pendingTxs);
              for(var p = 0; p < tempPending.length; p++) {
                pendingTxs.push(tempPending[p].key);
              }

              for(let listTx of listTxs) {
                await web3.eth.getBlock(listTx.blockNumber)
                  .then(response => {
                    let timestamp = response.timestamp;
                    let transactionHash = listTx.transactionHash;
                    let transactionFrom = listTx.returnValues._from;
                    let transactionAmount = listTx.returnValues._value;

                    if(pendingTxs.includes(listTx.transactionHash)) {
                      this.pendingTxs = this.pendingTxs.filter((tx) => {return tx.key != listTx.transactionHash});

                      localStorage.setItem('tokenPendingTxs', JSON.stringify(this.pendingTxs));
                    }

                    if(parseInt(timestamp) > lastTxTimestamp) {
                      completedTx = {
                        key: transactionHash,
                        timestamp: timestamp,
                        from: _.toLower(transactionFrom),
                        amount: transactionAmount
                      };

                      this.completedTxs = [completedTx].concat(this.completedTxs);

                      localStorage.setItem('tokenCompletedTxs', JSON.stringify(this.completedTxs));

                      this.refreshing = false;
                    } else {
                      this.refreshing = false;
                    }
                  }).catch(error => {console.log(error)});
              }
            } else {
              localStorage.setItem('tokenCompletedTxs', JSON.stringify(this.completedTxs));
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
