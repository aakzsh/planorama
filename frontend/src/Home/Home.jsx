import { useState } from "react"
import Calendar from "../Agenda/Calendar"
import "./Home.css"

const Home = () =>{
    const [isConflicting, setConflicting] = useState(true)
    return (
        <div className="homescreen">
            <div className="calendar-and-alert">
                <div className="calendar-area">
                    <Calendar/>
                </div>
                <div className="alert-box" style={{backgroundColor: isConflicting?"#FB7575": "#79EB44"}}>
                    <p>{isConflicting?"ALERT: youve conflicting agendas, view and fix!": "No issues, all appointments are fine!"}</p>
                </div>
            </div>

            <div className="home-right">
                <div className="set-working-hours">
                    <p>Set your working hours</p>
                    <div className="setter-box">

                    </div>
                </div>
                <div className="create-new-appointment">
                    <p>Create new appointment</p>
                    <div className="setter-box">
                        
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Home