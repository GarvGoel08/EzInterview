import React from 'react'
import './InterviewResults.css'

export default function InterviewResults({total, label, image}) {
  return (
    <div className="ResultMain">
        <div className="flex ResultImgDiv">
            <img className='ResultImg' src={`https://img.icons8.com/${image}-filled`} />
        </div>
        <div className="flex flex-column ResultStats">
            <label className="ResultHeading">{label}</label>
            <label className="ResultText">{total}</label>
        </div>
    </div>
  )
}
