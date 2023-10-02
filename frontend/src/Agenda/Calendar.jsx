import React, { useEffect, useState } from "react";
import * as dateFns from "date-fns";
import axios from "axios"

import './Calendar.css'


const Calendar = () => {

   const dummydata = [
      {
        title: "Some event that I am manipulating outside of the context of Nylas",
        description: "Passed in from HTML!",
        participants: [],
        when: { end_time: 1696245368201, object: "timespan", start_time: 1698242368201 }
      },
      {
        title: "A third event of the day",
        description: "Passed in from HTML!",
        participants: [],
        when: { end_time: 1696245368201, object: "timespan", start_time: 1696245368201 }
      }
    ]; 
   const [staticEvents, setStaticEvents] = useState([])
   useEffect(()=>{
      async function getEvents(){
         const token = await sessionStorage.getItem("accessToken")
         const res = await
         axios.get("http://localhost:9000/nylas/get-calendar-events/"+token).then((response) => {
            console.log(response)
            setStaticEvents(response.data.data)
          });
      }
      getEvents()
   },[])

   const [currentDate, setCurrentDate] = useState(new Date());
   const [selectedDate, setSelectedDate] = useState(new Date());


      const header = () => {
      const dateFormat = "MMMM yyyy";


      return (
         <center>
            <div className="header row flex-middle">
            <div className="column col-start">
               <div className="icon" onClick={prevMonth}>
                  chevron_left
               </div>
            </div>
            <div className="column col-center">
               <span>{dateFns.format(currentDate, dateFormat)}</span>
            </div>
            <div className="column col-end">
               <div className="icon" onClick={nextMonth}>
                  chevron_right
               </div>
            </div>
         </div>
         </center>
         );
      };
      
      const days = () => {
         
         const dateFormat = "ddd";
         const days = [];
         let startDate = dateFns.startOfWeek(currentDate);
      };
      const cells = () => {const monthStart = dateFns.startOfMonth(currentDate);
      const monthEnd = dateFns.endOfMonth(monthStart);
      const startDate = dateFns.startOfWeek(monthStart);
      const endDate = dateFns.endOfWeek(monthEnd);
      const dateFormat = "d";
      const rows = [];
      
      
      let days = [];
      let day = startDate;
      
      let formattedDate = "";while (day <= endDate) {
         for (let i = 0; i < 7; i++) {
         formattedDate = dateFns.format(day, dateFormat);
         let class_name = ""
         const cloneDay = day;
         if(!dateFns.isSameMonth(day, monthStart)){
            class_name = "disabled"
         }
         else{
            // console.log(day)
            let colliding = false;
            let found = false;
            for(let i =0; i<staticEvents.length;i++){
               let start_day  = new Date(staticEvents[i].when.start_time*1000);
               // start_day.setHours(0, 0, 0, 0);
               // console.log("star time for ", staticEvents[i].when.start_time, " ", start_day)
               // start_day = start_day*1000
               console.log("new start date ", start_day)
               
               if(dateFns.isSameDay(day, start_day)){
                  class_name="eventlinedup";
                  found = true
                  break;
               }
            }
            if(colliding && found){
               class_name = "conflictingevent"
            }
         }
         
         if(dateFns.isSameDay(day, selectedDate)){
            class_name += " selected"
         }

         days.push(
            <div 
            // className={`column cell ${!dateFns.isSameMonth(day, monthStart)
            // ? "disabled" : dateFns.isSameDay(day, selectedDate) 
            // ? "conflictingevent" : "eventlinedup" }`} 
            className={"column cell " + class_name}
            key={day} 
         // idhar set hoga classname se
            > 
            <span className="number">{formattedDate}</span>
            <span className="bg">{formattedDate}</span>
         </div>
         );
         day = dateFns.addDays(day, 1);
      }rows.push(
            <div className="row" key={day}> {days} </div>
         );
         days = [];
      }
      return <div className="body">{rows}</div>;
      };

      const nextMonth = () => {
         setCurrentDate(dateFns.addMonths(currentDate, 1));
      };

      const prevMonth = () => {
         setCurrentDate(dateFns.subMonths(currentDate, 1));
      };

      const onDateClick = day => {
      setSelectedDate(day);
      }


      
      return (
         <div className="calendar">
            <div>{header()}</div>
            <div>{days()}</div>
            <div>{cells()}</div>
         </div>
      );
};
      
export default Calendar;