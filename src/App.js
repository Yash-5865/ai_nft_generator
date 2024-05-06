import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';

// Components
import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';

// ABIs
import NFT from './abis/NFT.json'

// Config
import config from './config.json';

function App() {
  const [provider, addProvider] = useState(null)
  const [account, addAccount] = useState(null)

  const [image,addImage] = useState(null)
  const [name,addName] = useState("")
  const [description,addDescription] = useState("")
  const[url,addReturn] = useState(null)
  
  const Blockchain = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    addProvider(provider)
  }

  const submitForm = async (e) => {
    e.preventDefault()
    const AI_Image = newImage()
    const To_Contract = await ImageToContract(AI_Image)
    console.log(To_Contract)
  }

  const newImage = async () => {
    try {
      console.log("New Image");
  
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
        {
          inputs: description,
          options: { wait_for_model: true },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );
  
      const dt = response.data;
      const returnImage = response.headers["content-type"];
  
      const new_dt = Buffer.from(dt).toString("base64");
      const obj = `data:${returnImage};base64,${new_dt}`;
  
      addImage(obj);
  
      return dt;
    } catch (error) {
      console.error("Error fetching image:", error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  };

  const ImageToContract = async (AI_Image) => {
    console.log("Adding image to contract")
    const store1 = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })
    
    const { nft_ip } = await store1.store({
      image: new File([AI_Image], "image.jpeg", { type: "image/jpeg" }),
      name: name,
      description: description,
    })

    const returnValue = `https://ipfs.io/ipfs/${nft_ip}/metadata.json`

    addReturn(returnValue)

    return returnValue

  };

  useEffect(() => {
    Blockchain()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={addAccount} />
      
      <div className='form'>
        <form onSubmit={submitForm}>
          <input type="text" placeholder='Create a Name' onChange={(e) => {addName(e.target.value)}}/>
          <input type="text" placeholder='Create a Description' onChange={(e) =>{addDescription(e.target.value)}}/>
          <input type="submit" value="Mint AI NFT"/>
        </form>
        
        <div className='image'>
          <img src={image} alt="AI NFT" />
        </div>
      </div>

      <p>View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a></p>

    </div>
  );
}

export default App;











