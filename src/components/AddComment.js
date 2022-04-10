import React, { Component } from 'react';
import Rating from '@mui/material/Rating';


export default class AddComment extends Component {

    constructor(props) {
        super(props);
        this.error = React.createRef();
        this.state = { 
            IsPopupOpen: false,
            comment: "",
            rate: 1,
            nickname: ""
        };
    }

    handleChangeNickname = (event) => {
        if(!this.error.current.classList.contains("hidden")){
            this.error.current.classList.add("hidden")
        }
        this.setState({nickname: event.target.value});
    }

    handleChangeComment = (event) => {
        if(!this.error.current.classList.contains("hidden")){
            this.error.current.classList.add("hidden")
        }
        this.setState({comment: event.target.value});
    }

    cancelAddComment = () => {
        this.resetInputs()
        this.props.closeAddComment()
    }

    addComment = async () => {
        if(this.state.nickname == ""){
            this.error.current.classList.remove("hidden")
        }
        else{
            this.props.sendComment({
                        nickname: this.state.nickname,
                        rate: this.state.rate,
                        comment: this.state.comment
                    })      
            this.resetInputs()  
        } 
    }

    resetInputs = () => {
        this.setState({nickname: ""})
        this.setState({rate: 1})
        this.setState({comment: ""})
    }

    render() {
        return(
            <div className='m-1 mt-1'>
            <div className='bg-neutral-800 rounded mt-5 p-2'>
            <div className='flex flex-col sm:flex-row sm:items-center'>
                    <label className="block text-white mb-1 mt-2 mr-2" htmlFor="nickname">Pseudo :</label>
                    <input value={this.state.nickname} onChange={this.handleChangeNickname} id="nickname" className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:ring-2 focus:border-blue-500" type="text" placeholder="Pseudo"></input>
            </div>
            <div className='flex items-center'>
                <label className="block text-white mb-1 mt-1 mr-2" htmlFor="ricardPrice">Note :</label>
                <div className='mt-1'>
                    <div className='flex items-center'>
                        <Rating
                        size="large"
                        value={this.state.rate}
                        icon={<img className='w-8 sm:w-6' src="/images/beer.png"/>}
                        emptyIcon={<img className='w-8 sm:w-6' src="/images/beer-void.png"/>}
                        onChange={(event, newValue) => {
                            this.setState({rate: newValue})
                        }}
                        />
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-white mb-1" htmlFor="comment">Commentaire :</label>
                <textarea value={this.state.comment} onChange={this.handleChangeComment} rows="4" id="comment" className="mb-2 resize-none form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:ring-2 focus:border-blue-500 focus:outline-none" placeholder="Commentaire"></textarea>
            </div>
            <div ref={this.error} className='hidden text-red-500'>Merci de renseigner tous les champs</div>
            <div className='flex justify-end mt-2'>
                <button type="button" onClick={this.cancelAddComment} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2 sm:px-4 sm:py-1 bg-gray-200 text-base text-gray-700 font-medium text-white hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ml-3 w-auto text-sm sm:text-sm">
                Annuler</button>
                <button type="button" onClick={this.addComment} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2 sm:px-4 sm:py-1 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-3 w-auto text-sm sm:text-sm">
                Envoyer</button>
            </div>           
            </div>
        </div>
        )
    }

}