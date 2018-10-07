import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import RadicalPixelsAbi from '../../build/contracts/RadicalPixels.json'
import 'bootstrap/dist/css/bootstrap.css'
import PixelMap from './PixelMap';
import logo from '../../assets/logo.jpg';
import ipfs from '../../assets/ipfs.json';

require('babel-polyfill')
require('babel-register')

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      pixels: ipfs,
      purchased: false,
      loading: true,
      buying: false,
      selectedPixelIndex: 0
    }

    this.purchase = this.purchase.bind(this)
    this.saveColors = this.saveColors.bind(this)

    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    
  }

  handleSelectionChange(newSelection){
    this.setState({selectedPixelIndex : newSelection});
    
  }

  componentDidMount() {

    web3.eth.getAccounts((err, accounts) => {
      this.setState({account : accounts[0]})
      console.log("error " + err + " account " + accounts)
    })

    let RadicalPixels = web3.eth.contract(RadicalPixelsAbi);

    console.log(RadicalPixels)

    this.radicalInstance = RadicalPixels.at("0x2d31eB328000e3314243d49a459Ae03127663Ad0");
   
    console.log(this.radicalInstance)
    //this.watchEvents();

    /*
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
         console.log(xhttp.responseText);
      }
    };
    

    xhttp.open("GET", 'http://radicalpixels.io:8000/grid', true);
    xhttp.send();
    */
  }

  watchEvents() {
    this.radicalInstance.soldEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch((error, event) => {
      this.setState({ buying: false })
    })
  }

  async saveColors(){
    const x = this.state.pixels[this.state.selectedPixelIndex].x;
    const y = this.state.pixels[this.state.selectedPixelIndex].y;

    this.setState({ buying: true });

    let contentData = "";
    
    for (let i = 0; i ++; i < 9){
      contentData += this.state.pixels[this.state.selectedPixelIndex].color.substring(1);
    }
    
    console.log(contentData);

    this.radicalInstance.addFunds({value : web3.toWei(this.refs.priceInput.value, "ether")}, (error, result) => {
      this.radicalInstance.changeContentData(x, y, contentData, (result) => {
        this.setState({ purchased: true })
      })
    });
    
  }

  async purchase() {

    const x = this.state.pixels[this.state.selectedPixelIndex].x;
    const y = this.state.pixels[this.state.selectedPixelIndex].y;

    this.setState({ buying: true });
    
    let contentData = "";
    
    for (let i = 0; i ++; i < 9){
      contentData += this.state.pixels[this.state.selectedPixelIndex].color.toString().substring(1);
    }

    this.radicalInstance.pixelByCoordinate.call(x, y, (error, result) => {
      
      if ((result[1] == undefined) || (parseInt(result[1], 16) == 0)){
        //uninitialized
        this.radicalInstance.addFunds({value : web3.toWei(this.refs.priceInput.value, "ether")}, (error, result) => {
          this.radicalInstance.buyUninitializedPixelBlock(x, y,  web3.toWei(0.1, "ether"), contentData, (result) => {
            this.setState({ purchased: true })
          })
        })
      }
      else{
        //initialized
        this.radicalInstance.addFunds({value : web3.toWei(this.refs.priceInput.value, "ether")}, (error, result) => {
          this.radicalInstance.buyPixelBlock(x, y,  web3.toWei(0.1, "ether"), contentData, (result) => {
            this.setState({ purchased: true })
          })
        })
      }
    });
  }

  render() {
    return (
      <div>
        
        <div style={{
          'position': 'fixed',
          'z-index': '100',
          'top': '0px',
          'left:': '0px',
          'width': '100%',
          'height': '60px',
          'backgroundColor':'white',
          'box-shadow:': '0 5px 15px rgba(0,0,0,0.3)',
          '-webkit-box-shadow': '0 5px 15px rgba(0,0,0,0.3)'}}>
          <img src={logo} style={{'width': '40px', 'height': '40px', 'margin': '10px 10px 0px 10px','float':'left'}}/>
          <h2 style={{'margin-top': '10px'}}>Radical Pixels</h2>
        </div>

       
        <div style={{
          'position': 'fixed', 
          'z-index': '-1',
          'top': '60px', 
          'right': '0px',
          'width': '300px',
          'height': '100%',
          'backgroundColor': '#1d2d3c'}}>
          <h5 style={{'color':'white', 'margin-top': '10px', 'margin-left': '10px'}}>Pixel: {this.state.selectedPixelIndex}</h5>
          <h5 style={{'color':'white', 'margin-top': '10px', 'margin-left': '10px'}}>Owner: {this.state.pixels[this.state.selectedPixelIndex].owner}</h5>
          <h5 style={{'color':'white', 'margin-top': '10px', 'margin-left': '10px'}}>Price: 100TH</h5>
          
          <input class="form-control rounded-0" ref="priceInput" placeholder="0.2 ETH"
           style={{
             'position': 'absolute',
             'bottom': '140px',
             'left': '20px',
             'width': '270px',
             'height': '40px',
           }}
          />

          <button class="btn-success" onClick={this.purchase} style={{
            'position': 'absolute',
            'bottom': '80px',
            'left': '20px',
            'width': '170px',
            'height': '40px',
            'cursor': 'pointer',
            'enabled': false
          }}>PURCHASE PIXEL</button>

          <button class="btn-success" onClick={this.saveColors} style={{
            'position': 'absolute',
            'bottom': '80px',
            'left': '200px',
            'width': '89px',
            'height': '40px',
            'cursor': 'pointer',
            'enabled': false
          }}>SAVE</button>

        </div>


        {/* this.state.loading || this.state.buying
          ? <p class='text-center'>Loading...</p>
          : <Content
              account={this.state.account}
              candidates={this.state.candidates}
              hasVoted={this.state.hasVoted}
              castVote={this.castVote} />
        */}
          
        {/*
        <div class='row' style={{'margin-left': '10px'}}>
          <PixelMap pixels = {this.state.pixels}/>
        </div>
        */}

        <div style={{
          'position': 'fixed', 
          'top': '60px',
          'left': '0px',
          'bottom': '0px',
          'right': '300px',
          'overflow': 'scroll'
          }}>
          <PixelMap pixels = {this.state.pixels} owner={'0x0'} onSelectionChange={this.handleSelectionChange} selectedpixelindex = {this.state.selectedPixelIndex}/>
        </div>

      </div>
    )
  }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
