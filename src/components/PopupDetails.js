import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlusCircle, faCamera, faTrashCan, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import '../css/PopupDetails.css'
import AddComment from './AddComment';
import axios from 'axios'
import Comment from './Comment';
import Dropzone from 'react-dropzone'
import { DeletePlace } from './Popup/DeletePlace.js'
import PopupAddPlace from './PopupAddPlace.js'


//const images = require.context('../uploads', true);


export default class PopupDetails extends Component {
    constructor(props) {
        super(props);
        this.config = { headers: { 'Content-Type': 'multipart/form-data' } };
        this.popupPlace = React.createRef();
        this.deletePopup = React.createRef();
        this.commentContainer = React.createRef();
        this.editPlacePopup = React.createRef();
        this.state = { 
            AddingComment: false,
            detailsData:{
                name: "",
                desc:"",
                images:[]
            },
            comments: []
        };
    }

    
    closePopup = () => {
      this.popupPlace.current.classList.remove('show')
      setTimeout(() =>{
        this.closeAddComment()
        this.commentContainer.current.classList.add('hidden')
        this.popupPlace.current.classList.add('hidden')
      },300)
      this.props.updateDetailsPopupState(false)
    }

    openGoogleMap = () => {
      window.open(`http://www.google.com/maps/place/${this.props.detailsData.lat},${this.props.detailsData.lng}`, '_blank').focus();
    }

    openMenu = () => {
      window.open(this.state.detailsData.menu, '_blank').focus();
    }

    openPopup = () => {
      if(!this.props.popupAddOpen){
        this.props.updateDetailsPopupState(true)
        this.setState({detailsData : this.props.detailsData})
        this.loadComment()
        this.commentContainer.current.classList.remove('hidden')
        this.popupPlace.current.classList.remove('hidden')
        setTimeout(() =>{
            this.popupPlace.current.classList.add('show')
      },1)
      }
    }

    saveComment = (data) => {
      axios.post("/api/addComment", {
          placeid: this.props.detailsData.placeid,
          nickname: data.nickname,
          rate: data.rate,
          comment: data.comment,
          date: new Date().toLocaleDateString("fr")
        }).then(() => {
          this.closeAddComment()
          this.loadComment()
        })
        .catch(function (error) {
          console.log(error);
        });
  }

  loadComment = () => {
    axios.post("/api/getComments",{id: this.state.detailsData.placeid}).then((res) => {
      let data = res.data.reverse()
      this.setState({comments: data})
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleAddCommentClick = () => {
    this.setState({AddingComment: true})
  }

  closeAddComment = () => {
    this.setState({AddingComment: false})
  }

  uploadImage = async (file) => {
    let fd = new FormData();
    fd.append('file',file[0]);
    fd.append('placeid', this.props.detailsData.placeid);

    axios.post('/api/upload', fd)
      .then((response) => {
        this.reloadImage()
      })
      .catch(error => {
        console.log(error)
      })
  }

  openDeletePopup = () => {
    this.deletePopup.current.openPopup()
  }

  closePopupOnDelete = () =>{
    this.props.updateMap()
    this.closePopup()
  }

  reloadImage = () => {
    axios.post('/api/getPlaceImages', {
      id: this.props.detailsData.placeid
    }).then((response) => {
        let newData = this.state.detailsData
        newData.images = response.data.images
        this.setState({detailsData: newData})
      })
      .catch(error => {
        console.log(error)
      })
  }

  handleEditPlace = () =>{
    this.editPlacePopup.current.openPopup()
    this.popupPlace.current.classList.add('hidden')
  }

  handleValidateEditPlace = (data) => {
    this.popupPlace.current.classList.remove('hidden')
    if(data){
      this.setState({detailsData: data})
    }
  }


  render() {
    return(
      <div>
        <div ref={this.popupPlace} id="detailsPopupContainer" className="hidden">
          <div id="detailsPopup" className="rounded bg-neutral-600 overflow-hidden">
            <div className='h-4 fixed bg-neutral-600 rounded w-full bar'></div>
            <div className='h-4 absolute bottom-0 bg-neutral-600 w-full rounded bar'></div>
            <div className='h-full p-3 sm:p-5 overflow-y-auto'>
              <div className='w-full flex items-center justify-between'>
                <div className='text-white h-fit text-lg underline-skip border-b-4 border-blue-500'>{this.state.detailsData.name}</div>
                <div><FontAwesomeIcon id="closePopupButton" onClick={this.closePopup} icon={faXmark} size="xl" color="#9E9E9E" /></div>
              </div>
              <div>
                <div className='my-2'>
                {this.state.detailsData.desc}
                </div>
                <div className=''>
                  <div className='flex justify-end mb-2'>
                    <Dropzone onDrop={this.uploadImage}>
                    {({getRootProps, getInputProps}) => (
                      <section className='w-fit'>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} accept='image/*'/>
                          <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2 sm:px-4 sm:py-1 bg-violet-400 text-base font-medium text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 w-auto text-sm sm:text-sm">
                              Ajout <FontAwesomeIcon icon={faCamera} className='ml-1 icon-photo'  size="lg" color="#fff" /></button>
                        </div>
                      </section>
                    )}
                    </Dropzone>
                  </div>
                  { this.state.detailsData.images.length !=0 ? <div className='scrolling-wrapper p-1 rounded overflow-y-hidden flex h-48 bg-neutral-800 overflow-x-auto whitespace-nowrap'>
                    {this.state.detailsData.images.map( (item, i) => 
                    <img key={i} className='mr-1 w-auto' style={{"height": "11.5rem"}} src={"/images/uploads/" + item} /> )}
                  </div> : ""}
                </div>
                <div className='mt-3 rounded p-2 bg-neutral-700'>
                  <div className=''>
                      <div className='flex'>
                        <div className='underline-skip border-violet-500' style={{'marginTop': '2px', 'borderBottomWidth':'3px'}}>Prix de la pinte</div>
                      </div>
                      <div className='ml-3'>
                        <div className='flex'>
                        <div className='flex w-full items-center mt-2 sm:mt-0'>
                          <img className='w-auto h-5 mr-1' src="/images/beer.png"/>
                          <div className="block text-white" htmlFor="happyPrice"> Normal : { this.state.detailsData.beerPrice == null ? " inconnu" : " " + this.state.detailsData.beerPrice +"€"}</div>
                        </div>
                        </div>
                        <div className='flex'>
                        <div className='flex w-full items-center mt-2 sm:mt-0'>
                          <img className='w-auto h-5 mr-1' src="/images/sun.png"/>
                          <div className="block text-white" htmlFor="happyPrice"> Happy Hour : { this.state.detailsData.happyPrice == null ? " inconnu" : " " + this.state.detailsData.happyPrice +"€"}</div>
                        </div>
                        </div>
                      </div>
                      <div className='flex mt-1'>
                        <img className='w-auto h-6 mr-1' src="/images/ricard.png"/>
                        <div style={{'marginTop': '2px'}}>
                        Prix du ricard :
                        { this.state.detailsData.ricardPrice == null ? " inconnu" : " " + this.state.detailsData.ricardPrice +"€"}</div>
                      </div>
                  </div>
                </div>
                <div className='mt-1 flex items-center justify-center'>
                  <button type="button" onClick={this.openGoogleMap} className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2 sm:px-4 sm:py-1 bg-blue-400 text-base font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 w-auto text-sm sm:text-sm">
                  Ouvrir Gooogle Maps</button>
                  { this.state.detailsData.menu ? <button type="button" onClick={this.openMenu} disabled={!this.state.detailsData.menu} className="mt-2 disabled w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2 sm:px-4 sm:py-1 bg-violet-400 text-base font-medium text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ml-3 w-auto text-sm sm:text-sm">
                  Ouvrir le menu</button> : "" }
                </div>
              </div>
              <div style={{minHeight: this.state.detailsData.images.length ==0 ? "40vh" : "15vh"}}>
                  <div className='bg-neutral-700 rounded mt-5 p-2'>
                  <div className='w-full flex justify-between items-center'>
                    <h6 className='text-lg'>Notes :</h6>
                    { !this.state.AddingComment ? <button type="button" onClick={this.handleAddCommentClick} className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-5 py-2 sm:px-4 sm:py-1 bg-blue-400 text-base font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-3 w-auto text-sm sm:text-sm">
                      <FontAwesomeIcon icon={faPlusCircle} size="lg" />
                    </button> : "" }
                  </div>
                  <div ref={this.commentContainer}>
                    { this.state.AddingComment ? <AddComment sendComment={this.saveComment} closeAddComment={this.closeAddComment}/> 
                    : this.state.comments.map((item,index)=> {
                      return <Comment key={index} refreshComment={this.loadComment} data={item}/>
                  }) }
                  </div>
                </div>
              </div>
              <div className='flex justify-around items-end mt-4'>
                <div className='text-red-500 text-sm cursor-pointer p-1 hover:text-red-600' style={{color: "#B63E3E"}} onClick={this.openDeletePopup}>
                  <FontAwesomeIcon icon={faTrashCan} className='mr-1' style={{color: "#B63E3E"}}/>
                  Supprimer ce lieu</div>
                <div className='text-blue-400 text-sm cursor-pointer p-1' onClick={this.handleEditPlace}>
                  <FontAwesomeIcon icon={faPenToSquare} className='mr-1 text-blue-400'/>
                  Éditer ce lieu</div>
              </div>
            </div>
            
          </div>
          <DeletePlace ref={this.deletePopup} id={this.state.detailsData.placeid} closePopupOnDelete={this.closePopupOnDelete}/>
        </div>
        <PopupAddPlace ref={this.editPlacePopup} updateMap={this.props.updateMap} handleValidateEditPlace={this.handleValidateEditPlace} mapref={this.props.map} detailsData={this.state.detailsData}/>
      </div>
        
    )
  }

}