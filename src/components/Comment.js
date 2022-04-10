import React, { Component } from 'react';
import Rating from '@mui/material/Rating';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DeleteComment } from './Popup/DeleteComment.js'


export default class Comment extends Component {

    constructor(props) {
        super(props);
        this.deleteComment = React.createRef();
        this.state = { };
    }

    openPopup = () => {
        this.deleteComment.current.handlePopup()
    }

    render() {
        return(
           <div className='rounded my-2 bg-neutral-500 p-2'>
               <div className='flex flex-col'>
                    <div className='flex justify-between'>
                        <div className='font-bold'>{this.props.data.nickname}</div>
                        <div className='text-sm'>{this.props.data.date}</div>
                    </div>
                    <div>
                        <Rating name="read-only"
                            value={this.props.data.rate} 
                            readOnly
                            size="small"
                            icon={<img className='w-5' src="/images/beer.png"/>}
                            emptyIcon={<img className='w-5' src="/images/beer-void.png"/>}
                            />
                    </div>
               </div>
               <div>{this.props.data.comment}</div>
               <div className='flex justify-end'>
                   <div className='w-fit'>
                        <FontAwesomeIcon onClick={this.openPopup} className='cursor-pointer' icon={faTrashCan} color="#B63E3E" />
                   </div>
                </div>
                <DeleteComment ref={this.deleteComment} refreshComment={this.props.refreshComment} id={this.props.data._id}/>
            </div>
            
        )
    }

}