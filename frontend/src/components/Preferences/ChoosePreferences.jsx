import React, {useState} from "react";
import "./ChoosePreferences.css";

const ChoosePreferences = ({title1, title2, handleChildRadioChange}) => {
    const [firstCardCheckedChild, setFirstCardCheckedChild] = useState(true)

    function onRadioChange(isFirstCard){
        console.log("called")
        if(isFirstCard){
            setFirstCardCheckedChild(true)
            handleChildRadioChange(true)
        } else {
            setFirstCardCheckedChild(false)
            handleChildRadioChange(false)
        }
    }
  return (
    <div>
      <h2 className="title">This or That</h2>

      <div className="grid-wrapper grid-col-auto">
        <label htmlFor="radio-card-1" className="radio-card">
          <input type="radio" name="radio-card" id="radio-card-1" checked={firstCardCheckedChild}/>
          <div className="card-content-wrapper" onClick={(e) => onRadioChange(true)}>
            <span className="check-icon"></span>
            <div className="card-content">
              <img
                src="https://image.freepik.com/free-vector/group-friends-giving-high-five_23-2148363170.jpg"
                alt=""
              />
              
              <h5>{title1}</h5>
            </div>
          </div>
        </label>
        <label htmlFor="radio-card-1" className="radio-card">
          <input type="radio" name="radio-card" id="radio-card-1" checked={!firstCardCheckedChild} />
          <div className="card-content-wrapper" onClick={(e) => onRadioChange(false)}>
            <span className="check-icon"></span>
            <div className="card-content">
              <img
                src="https://image.freepik.com/free-vector/group-friends-giving-high-five_23-2148363170.jpg"
                alt=""
              />
              
              <h5>{title2}</h5>
            </div>
          </div>
        </label>
      </div>
      
    </div>
  );
};

export default ChoosePreferences;
