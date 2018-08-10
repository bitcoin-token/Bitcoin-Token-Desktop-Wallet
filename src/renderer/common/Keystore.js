import { keystore } from 'eth-lightwallet';
import Web3 from 'web3';
import { AES, enc } from 'crypto-js';

class Keystore {

	load = async (password, callback) => {
		try {
			const seedEncrypted = await localStorage.getItem('seedEncrypted');
			const seedPhrase = AES.decrypt(seedEncrypted, password).toString(enc.Utf8);

			keystore.createVault({
				password: password,
				seedPhrase: seedPhrase,
				hdPathString: "m/44'/60'/0'/0"
			}, (error, ks) => {
				if(error) {
					alert('Keystore vault error.');
				} else {
					callback(ks);
				}
			})
		} catch (error) {
			alert('Keystore loading error.');
		}
	}

	getSeedPhrase = (password, callback) => {
    this.load(password, (ks) => {
      ks.keyFromPassword(password, (error, pwDerivedKey) => {
        if(error) {
          alert('Password key error.');
          return;
        } else {
          ks.generateNewAddress(pwDerivedKey, 1);

          callback(ks.getSeed(pwDerivedKey));
        }
      });
    }); 
	}

	getPrivateKey = (password, walletAddress, callback) => {
    this.load(password, (ks) => {
      ks.keyFromPassword(password, (error, pwDerivedKey) => {
        if(error) {
          alert('Password key error.');
          return;
        } else {
          ks.generateNewAddress(pwDerivedKey, 1);
          
          callback(ks.exportPrivateKey(walletAddress, pwDerivedKey));
        }
      });
    }); 
	}

}

const walletKeystore = new Keystore();

export default walletKeystore;