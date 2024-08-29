import { useState } from "react";
import { mnemonicToSeed, generateMnemonic } from "bip39";
import { Keypair, PublicKey } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Wallet, HDNodeWallet } from "ethers";

export default function Home() {
  const [mnemonic, setMnemonic] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>([]);

  async function createMnemonic() {
    const mn = await generateMnemonic();
    setMnemonic(mn);
  }

  async function createEthWallet() {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const wallet = new Wallet(privateKey);
    const address = wallet.address as string;
    setCurrentIndex(currentIndex + 1);
    setAddresses([...addresses, address]);
  }

  async function createSolanaWallet() {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    const publicKey = keypair.publicKey;
    setCurrentIndex(currentIndex + 1);
    setPublicKeys([...publicKeys, publicKey]);
  }

  const mnemonicWords = mnemonic.split(" ");
  const mnemonicGrid = [];

  for (let i = 0; i < mnemonicWords.length; i += 4) {
    mnemonicGrid.push(mnemonicWords.slice(i, i + 4));
  }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Wallet Generator</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={createMnemonic}
      >
        Create Mnemonic
      </button>
      <div className="grid grid-cols-1 gap-2 mb-8">
        {mnemonicGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2">
            {row.map((word, wordIndex) => (
              <div key={wordIndex} className="border p-2 text-center">
                {word}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={createEthWallet}
      >
        Create ETH Wallet
      </button>
      <div className="mb-8">
        <h1>Ethereum Addresses</h1>
        {addresses.map((address, index) => (
          <div key={index} className="bg-gray-900 p-2 mb-2 rounded">
            {address}
          </div>
        ))}
      </div>

      <button
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={createSolanaWallet}
      >
        Create Solana Wallet
      </button>
      <div className="mb-4">
        <h1>Solana Addresses</h1>
        {publicKeys.map((publicKey, index) => (
          <div key={index} className="bg-gray-900 p-2 mb-2 rounded">
            {publicKey.toBase58()}
          </div>
        ))}
      </div>
    </main>
  );
}
