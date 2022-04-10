import React, { Component } from 'react';
import '../css/PopupAddPlace.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';
import axios from 'axios'


export default class PopupAddPlace extends Component {

  constructor(props) {
      super(props);
      this.popup = React.createRef();
      this.error = React.createRef();
      this.searchBar = React.createRef();
      this.imageContainer = React.createRef();
      this.beer = React.createRef();
      this.state = { 
          imageToDelete: [],
          IsPopupOpen: false,
          addLocationType: 'search',
          geocoder: null,
          iconType:"beer",
          coordinate: null,
          name: "",
          desc: "",
          beerPrice: "",
          happyPrice: "",
          ricardPrice: "",
          menu: "",
          placeName:"",
      };
  }

  closePopup = () => {
      this.popup.current.classList.remove('show')
      setTimeout(() =>{
          this.resetInputs()
          this.popup.current.classList.add('hidden')
      },300)
      if(this.props.detailsData == null){
        this.props.updateAddPopupState(false)
      } 
  }

  openPopup = () => {
    if(this.props.detailsData != null){
      this.setState({
        iconType: this.props.detailsData.icon,
        name : this.props.detailsData.name,
        coordinate: [this.props.detailsData.lng,this.props.detailsData.lat],
        desc: this.props.detailsData.desc,
        beerPrice: this.props.detailsData.beerPrice ? this.props.detailsData.beerPrice : "",
        happyPrice: this.props.detailsData.happyPrice ? this.props.detailsData.happyPrice : "",
        ricardPrice: this.props.detailsData.ricardPrice ? this.props.detailsData.ricardPrice : "",
        menu: this.props.detailsData.menu,
        placeName: this.props.detailsData.placeName
      })

      document.querySelector('.mapboxgl-ctrl-geocoder--input').value = this.props.detailsData.placeName
      document.querySelector("#"+ this.props.detailsData.icon).click()

    }
    else{
      this.props.updateAddPopupState(true)
    }

    this.popup.current.classList.remove('hidden')
      setTimeout(() =>{
          this.popup.current.classList.add('show')
    },1)
  }

  handleBadgeLocationClick = event => {
    document.querySelectorAll('.badgelocation').forEach((e)=>{
      e.classList.remove('selectedBadgeLocation')

    })
    let type = event.target.dataset.type
    this.setState({addLocationType: type})
    event.target.classList.add('selectedBadgeLocation')

    if(type == "position"){
      this.getActualPosition()
      this.searchBar.current.classList.add('hidden')
    }
    else if(type == "search"){
      this.searchBar.current.classList.remove('hidden')
    }

  }

  resetInputs = () => {
    this.state.geocoder.clear()
    document.getElementById('addPlacePopup').scroll(0,0);
    this.setState({name: "",desc:"", beerPrice: "", ricardPrice:"",happyPrice:"",menu:"", coordinate: null, imageToDelete:[]})

    //Error
    if(!this.error.current.classList.contains("hidden")){
      this.error.current.classList.add("hidden")
    }
    //Icon
    document.querySelectorAll('.iconBadgeDiv').forEach((e)=>{
      e.classList.remove('selectedIconBadge')
    })
    //document.querySelector("#beer").classList.add('selectedIconBadge')

    this.beer.current.classList.add('selectedIconBadge')
    

    //Location
    document.querySelectorAll('.badgelocation').forEach((e)=>{
      e.classList.remove('selectedBadgeLocation')
    })
    document.querySelector("#search").classList.add('selectedBadgeLocation')
    this.searchBar.current.classList.remove('hidden')
  
  }

  getActualPosition = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({coordinate: [position.coords.longitude,position.coords.latitude ]})
    });
  }

  handleBadgeIconClick = event => {
    document.querySelectorAll('.iconBadgeDiv').forEach((e)=>{
      e.classList.remove('selectedIconBadge')
    })
    let target =  event.target
    if(!event.target.classList.contains('iconBadgeDiv')){
      target = event.target.parentElement
    }
    this.setState({iconType: target.id})
    target.classList.add('selectedIconBadge')
  }

  addPlace = (data) => { 
    axios.post("/api/addPlace", data ).then(() => {
      this.closePopup()
      this.props.updateMap()
    }).catch((error) => {
      this.error.current.classList.remove("hidden")
      console.log(error);
    });
  }

  editPlace = (data) => { 
    data._id = this.props.detailsData.placeid
    let images = this.props.detailsData.images
    if(this.state.imageToDelete.length != 0){
      this.state.imageToDelete.forEach((e)=>{
        images.splice(images.indexOf(e), 1);
      })
    }
    data.images = images

    axios.post("/api/editPlace", data ).then((res) => {
      if(images.length !=0){
        this.imageContainer.current.querySelectorAll('.images').forEach((e)=>{
        e.classList.remove('selectedImage')
        })
      }
      this.closePopup()
      this.props.updateMap()
      delete Object.assign(res.data, {["placeid"]: res.data["_id"] })["_id"];
      this.props.handleValidateEditPlace(res.data)
    }).catch((error) => {
      this.error.current.classList.remove("hidden")
      console.log(error);
    });
  }

  cancelEdit = () =>{
    this.closePopup()
    this.props.handleValidateEditPlace()
  }

  handleClose = () =>{
    if(this.props.detailsData != null){
      this.cancelEdit()
    }else{
      this.closePopup()
    }
  }

  handleValidate = () => {
    if(this.state.coordinate == null || this.state.name == ""){
      this.error.current.classList.remove("hidden")
    }
    else{
      let data = {
        name: this.state.name,
        lng: this.state.coordinate[0],
        lat: this.state.coordinate[1],
        icon: this.state.iconType,
        desc: this.state.desc,
        happyPrice: this.state.happyPrice,
        beerPrice: this.state.beerPrice,
        ricardPrice: this.state.ricardPrice,
        menu: this.state.menu,
        placeName: this.state.placeName
      }

      if(this.props.detailsData != null){
        this.editPlace(data)
      }else{
        this.addPlace(data)
      }
    } 
  }

  


  handleChangeName = (event) => {
    if(!this.error.current.classList.contains("hidden")){
      this.error.current.classList.add("hidden")
    }
    this.setState({name: event.target.value});
  }
  handleChangeDesc = (event) => {
    this.setState({desc: event.target.value});
  }
  handleChangeHappyPrice = (event) => {
    this.setState({happyPrice: event.target.value});
  }
  handleChangeBeerPrice = (event) => {
    this.setState({beerPrice: event.target.value});
  }
  handleChangeRicardPrice = (event) => {
    this.setState({ricardPrice: event.target.value});
  }
  handleChangeMenu = (event) => {
    this.setState({menu: event.target.value});
  }
  
  
  

  async componentDidMount(){
    let geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: 'fr',
      enableGeolocation: true,
      mapboxgl: mapboxgl
    });

    await this.setState({geocoder: geocoder})

    this.searchBar.current.appendChild(this.state.geocoder.onAdd(this.props.map));

    this.state.geocoder.on('result', (e) => {
      if(!this.error.current.classList.contains("hidden")){
        this.error.current.classList.add("hidden")
      }
      this.setState({coordinate: e.result.geometry.coordinates})
      this.setState({placeName: e.result.place_name})
    })
  }

  selectImage = (e) => {
    if(e.target.classList.contains("selectedImage")){
      e.target.classList.remove("selectedImage")
      let arr =  this.state.imageToDelete
      arr.splice(this.state.imageToDelete.indexOf(e.target.getAttribute("data-index")), 1);
      this.setState({imageToDelete: arr})
    }
    else{
      e.target.classList.add("selectedImage")
      this.state.imageToDelete.push(e.target.getAttribute("data-index")) 
    }
  }


  render() {
    return(
      <div ref={this.popup} id="addPlacePopupContainer" className='hidden'>
        <div id="addPlacePopup" className="rounded bg-neutral-600 overflow-hidden">
          <div className='h-4 fixed bg-neutral-600 rounded w-full bar-add'></div>
          <div className='h-4 absolute bottom-0 bg-neutral-600 w-full rounded bar-add'></div>
          <div className='h-full overflow-y-auto overflow-x-hidden p-2 md:p-5'>
            <div className='w-full flex mt-1 justify-between'>
              <h5 className='text-white text-xl'>{this.props.detailsData != null ? "Modification du lieu" : "Ajouter un lieu"} </h5>
            </div>
            <div className='my-5 mt-3 flex flex-col'>
              <div className='bg-neutral-700 rounded p-2'>
                <div><h6 className='text-lg underline decoration-4 decoration-blue-500'>Localisation</h6></div>
                <div className='mx-2 sm:mx-5 mt-1'>
                  <div className='flex items-center hidden'>
                    <div onClick={this.handleBadgeLocationClick} data-type="search" id="search" className='flex items-center text-sm sm:text-base selectedBadgeLocation w-1/2 sm:w-fit badgelocation py-1 rounded rounded-r rounded-r-none  border-2 px-2 cursor-pointer'><FontAwesomeIcon icon={faMagnifyingGlass} className='mr-1' />Recherche</div>
                    <div onClick={this.handleBadgeLocationClick} data-type="position" className='flex items-center text-sm sm:text-base badgelocation w-1/2 sm:w-fit rounded rounded-l py-1 rounded-l-none px-2 border-2 border-l-0 cursor-pointer'><FontAwesomeIcon icon={faCrosshairs} className='mr-1' />Position actuelle</div>
                  </div>
                  <div className='mt-2'>
                    <div><div ref={this.searchBar}></div></div>
                  </div>
                </div>
              </div>
              {this.props.detailsData != null && this.props.detailsData.images.length !=0 ? 
              <div className='bg-neutral-700 rounded p-2 pb-6 my-3'>
                <div><div className='text-lg border-blue-500 underline-skip' style={{'borderBottomWidth':'3px'}}>Images</div></div>
                <div><h6 className=''>Sélectionner les images à supprimer</h6></div>
                <div className='mx-2 sm:mx-5 mt-1'>
                  <div className='mt-2'>
                    <div ref={this.imageContainer} className='scrolling-wrapper p-1 rounded overflow-y-hidden flex h-48 bg-neutral-800 overflow-x-auto whitespace-nowrap'>
                      {this.props.detailsData.images.map((item, i) => 
                        <img key={i} data-index={item} className='mr-1 w-auto images cursor-pointer' onClick={this.selectImage} style={{"height": "11.5rem"}} src={"/images/uploads/" + item} /> )}
                    </div>
                  </div>
                </div>
              </div> :  ""}
              <div className='bg-neutral-700 rounded my-3 pb-6 p-2'>
                <div><h6 className='text-lg underline decoration-4 decoration-blue-500'>Informations</h6></div>
                <div className='mx-2 sm:mx-5'>
                  <div className='mt-2'>
                    <div className="flex badgeIcon">
                        <div ref={this.beer} className='iconBadgeDiv flex items-center selectedIconBadge' id="beer" onClick={this.handleBadgeIconClick}><img className='w-6' src="/images/beer.png"/></div>
                        <div className='iconBadgeDiv flex items-center' id="ricard" onClick={this.handleBadgeIconClick}><img className='w-5' src="/images/ricard.png"/></div>
                        <div className='iconBadgeDiv flex items-center' id="shot" onClick={this.handleBadgeIconClick}><img className='w-7' src="/images/shot.png"/></div>
                    </div>
                  </div>
                  <div>
                      <label className="block text-white mb-1" htmlFor="name">Nom</label>
                      <input value={this.state.name} onChange={this.handleChangeName} id="name" className="shadow appearance-none border rounded h-8 w-full py-1 px-2 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:ring-2 focus:border-blue-500" type="text" placeholder="Nom du lieu"></input>
                  </div>
                  <div>
                      <label className="block text-white mb-1" htmlFor="desc">Description</label>
                      <textarea value={this.state.desc} onChange={this.handleChangeDesc} rows="3" id="desc" className="mb-2 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:ring-2 focus:border-blue-500 focus:outline-none" placeholder="Description du lieu"></textarea>
                  </div>
                  <div className='flex items-center mb-1'>
                    <label className="block underline-skip text-white underline-skip border-violet-500" style={{'borderBottomWidth':'3px'}}>Prix de la pinte</label>
                  </div>
                  <div className='mb-3 flex flex-col md:flex-row ml-2'>
                    <div className='w-full'>
                      <div className='flex'>
                        <img className='w-5 h-5 mr-1' src="/images/beer.png"/>
                        <label className="block text-white mb-1" htmlFor="beerPrice">Normal</label>
                      </div>
                      <div className='flex items-center'>
                        <input value={this.state.beerPrice} onChange={this.handleChangeBeerPrice} id="beerPrice" className="shadow appearance-none border rounded-l h-8 w-full md:w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:ring-2 focus:border-blue-500" type="number" placeholder="Prix"></input>
                        <div className='p-1 px-2 rounded-r-md  bg-neutral-800'>€</div>
                      </div>
                    </div>
                    <div className='w-full'>
                      <div className='flex items-center mt-2 sm:mt-0'>
                        <img className='w-auto h-5 mr-1' src="/images/sun.png"/>
                        <label className="block text-white mb-1" htmlFor="happyPrice">Happy Hour</label>
                      </div>
                      <div className='flex items-center'>
                        <input value={this.state.happyPrice} onChange={this.handleChangeHappyPrice} id="happyPrice" className="shadow appearance-none border rounded-l h-8 w-full md:w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:ring-2 focus:border-blue-500" type="number" placeholder="Prix"></input>
                        <div className='p-1 px-2 rounded-r-md bg-neutral-800'>€</div>
                      </div>
                    </div>
                  </div>
                  <div className='w-full'>
                      <div className='flex items-center mt-2 sm:mt-0'>
                        <img className='w-4 h-5 mr-1' src="/images/ricard.png"/>
                        <label className="block text-white mb-1" htmlFor="ricardPrice">Prix du ricard</label>
                      </div>
                      <div className='flex items-center'>
                        <input value={this.state.ricardPrice} onChange={this.handleChangeRicardPrice} id="ricardPrice" className="shadow appearance-none border rounded-l h-8 w-full md:w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:ring-2 focus:border-blue-500" type="number" placeholder="Prix"></input>
                        <div className='p-1 px-2 rounded-r-md bg-neutral-800'>€</div>
                      </div>
                    </div>
                  <div>
                      <label className="block text-white mb-1" htmlFor="menu">Lien vers le menu</label>
                      <input value={this.state.menu} onChange={this.handleChangeMenu} id="menu" className="shadow appearance-none border rounded h-8 w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:ring-2 focus:border-blue-500" type="text" placeholder="Lien vers la menu"></input>
                  </div>
                </div>
              </div>
              <div ref={this.error} className='hidden bg-red-500 text-white rounded p-2'>Merci de renseigner la localisation et le nom du lieu</div>
              <div className='p-2 flex justify-end mb-2'>
                <button type="button" onClick={this.handleClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-0 ml-3 w-auto text-sm">
                  Annuler</button>
                <button type="button" onClick={this.handleValidate} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-3 w-auto text-sm">
                  {this.props.detailsData != null ? "Modifier" : "Ajouter"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}