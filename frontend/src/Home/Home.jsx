import { useEffect, useState } from "react";
import Calendar from "../Agenda/Calendar";
import "./Home.css";
import alerticon from "../images/alert-triangle.svg";
import axios from "axios";
import accumulateConflicts from "../utils/accumulate_conflicts";

const Home = () => {
  const [isConflicting, setConflicting] = useState(true);
  const [staticEvents, setStaticEvents] = useState([])
  const [conflicts, setConflicts] = useState([])
  const handleChildStateUpdate = (val) => {
    setConflicting(val);
  };
  async function handleStaticEventsUpdate (val)  {
    const ans = await accumulateConflicts(val)
    // console.l
    setConflicts(ans)
    setStaticEvents(val);
  };

  const [monday, selectMonday] = useState(false);
  const [tuesday, selectTuesday] = useState(false);
  const [wednesday, selectWednesday] = useState(false);
  const [thursday, selectThursday] = useState(false);
  const [friday, selectFriday] = useState(false);
  const [saturday, selectSaturday] = useState(false);
  const [sunday, selectSunday] = useState(false);
  const days = [
    ["Monday", monday, selectMonday],
    ["Tuesday", tuesday, selectTuesday],
    ["Wednesday", wednesday, selectWednesday],
    ["Thursday", thursday, selectThursday],
    ["Friday", friday, selectFriday],
    ["Saturday", saturday, selectSaturday],
    ["Saturday", sunday, selectSunday],
  ];

  const [starthr, setStarthr] = useState(null);
  const [startmin, setStartmin] = useState(null);
  const [endhr, setEndhr] = useState(null);
  const [endmin, setEndmin] = useState(null);
  const [savingText, setSavingText] = useState("Save");

  const [appointmentStart, setAppointmentStart] = useState(null);
  const [appointmentEnd, setAppointmentEnd] = useState(null);
  const [appointmentText, setAppointmentText] = useState(null);

  const [isExpanded, setExpanded] = useState(false)
  useEffect(() => {
    async function getHoursandDays() {
      const hrs = await sessionStorage.getItem("time_array").split(",");
      setStarthr(hrs[0]);
      setStartmin(hrs[1]);
      setEndhr(hrs[2]);
      setEndmin(hrs[3]);
      const days = await sessionStorage.getItem("day_array").split(",");
      // console.log("days are", days);
      selectMonday(days[0] == "true");
      selectTuesday(days[1] == "true");
      selectWednesday(days[2] == "true");
      selectThursday(days[3] == "true");
      selectFriday(days[4] == "true");
      selectSaturday(days[5] == "true");
      selectSunday(days[6] == "true");
      // console.log(monday);
      // console.log("hrs are ", hrs);
    }

    getHoursandDays();
  }, []);
  async function saveHoursandDays() {
    setSavingText("Saving...");
    let day_array = [
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    ];
    await sessionStorage.setItem("day_array", day_array);
    let working_hrs = [starthr, startmin, endhr, endmin];
    await sessionStorage.setItem("time_array", working_hrs);
    // console.log("done");
    // setSavingText("Save");
  }

  async function createAppointment() {
    if (
      appointmentEnd === null ||
      appointmentStart === null ||
      appointmentText === null
    ) {
      alert("Please fill all reqd fields");
    } else {
      const token = await sessionStorage.getItem("accessToken");
      var date1 = Date.parse(appointmentStart) / 1000;
      var date2 = Date.parse(appointmentEnd) / 1000;
      //  return datum/1000;
      const calendar_id = sessionStorage.getItem("calendar_id");
      if (calendar_id === null) {
        alert(
          "Please add at least one event on calendar manually then proceed with Planorama"
        );
      } else {
        const res = await axios.post("http://localhost:9000/nylas/add-event/", {
          title: appointmentText,
          calendar_id: calendar_id,
          when: {
            start_time: date1,
            end_time: date2,
          },
          participants: [],
          token: token,
        });
        // console.log(appointmentEnd, appointmentStart, appointmentText);
        // console.log(res);
        if(res.data.code===200){
          alert("Added event successfully! Reload to view")
        }
      }
    }
  }

  return (
    <div className="homescreen">
      <div className="calendar-and-alert">
        <div className="calendar-area">
          <Calendar handleChildStateUpdate={handleChildStateUpdate} handleStaticEventsUpdate={handleStaticEventsUpdate}/>
        </div>
        {isConflicting ? (
          <div className="alert-box" style={{ backgroundColor: "#FB7575" }} onClick={()=>{setExpanded(!isExpanded)}}>
            <div class="parent"></div>

            <p>
              Alert: You have conflicting meetings, click here to view and fix!
            </p>
          </div>
        ) : (
          <div className="alert-box" style={{ backgroundColor: "#79EB44" }}>
            <p>No issues: All meetings are fine and not conflicting!</p>
          </div>
        )}
        {
          isExpanded?<div className="expanded-events">
          {conflicts.map((el, index)=>{
            // console.log(el)
            return <div>
              <strong><p style={{color: "red"}}>Conflict {index+1}</p></strong>
              {el.map((event)=>{
                let start = new Date(event.when.start_time * 1000).toString()
                let end = new Date(event.when.end_time * 1000).toString()
                console.log(start)
                return <div style={{marginBottom: "2rem"}}>
                  <p>{event.title}</p>
                  <p style={{opacity: 0.7, fontSize: "0.9rem"}}>{start} <strong>to</strong> {end}</p>
                </div>
              })}
              <br />
              
            </div>
          })}
          <button>Fix these conflicts using AI</button>
          <br />
          <br />
        </div>: <p></p>
        }
      </div>

      

      <div className="home-right">
        <div className="create-new-appointment">
          <strong>
            <p>Legend</p>
          </strong>
          <div>
            <div className="legend-div">
              <div
                className="legend-color"
                style={{
                  background:
                    "linear-gradient(90deg, #218230 0%, #4aff53 100%)",
                }}
              ></div>
              <p>: No Conflicts!</p>
            </div>
            <div className="legend-div">
              <div
                className="legend-color"
                style={{
                  background:
                    "linear-gradient(90deg, #c3746b 0%, hsl(10, 94%, 53%) 100%)",
                }}
              ></div>
              <p>: There are Conflicts!</p>
            </div>
            <div className="legend-div">
              <div
                className="legend-color"
                style={{
                  background:
                    "linear-gradient(90deg, #C16BC3 0%, #9BAACF 100%)",
                }}
              ></div>
              <p>: Current Day</p>
            </div>
          </div>
        </div>
        <div className="set-working-hours">
          <strong>
            <p>Set your working days and hours</p>
          </strong>
          <div className="setter-box">
            <p>Select working days</p>
            <div className="days-container">
              {days.map((day) => {
                let class_name = "day-selector";
                if (day[1]) {
                  class_name += " day-selected";
                }
                return (
                  <div
                    className={class_name}
                    onClick={() => {
                      // sessionStorage.setItem("")
                      day[2](!day[1]);
                    }}
                  >
                    <p>{day[0]}</p>
                  </div>
                );
              })}
            </div>
            <br />
            <p>Set working hours</p>
            <div className="working-hrs-container">
              <input
                type="text"
                className="working-hrs"
                placeholder="HH"
                value={starthr}
                onChange={(evt) => {
                  setStarthr(evt.target.value);
                }}
              />
              <input
                type="text"
                className="working-hrs"
                placeholder="MM"
                value={startmin}
                onChange={(evt) => {
                  setStartmin(evt.target.value);
                }}
              />
              <strong>
                <p>TO</p>
              </strong>
              <input
                type="text"
                className="working-hrs"
                placeholder="HH"
                value={endhr}
                onChange={(evt) => {
                  setEndhr(evt.target.value);
                }}
              />
              <input
                type="text"
                className="working-hrs"
                placeholder="MM"
                value={endmin}
                onChange={(evt) => {
                  setEndmin(evt.target.value);
                }}
              />
            </div>
            <button
              className="save-btn"
              onClick={() => {
                saveHoursandDays();
              }}
            >
              {savingText}
            </button>
          </div>
        </div>
        <div className="create-new-appointment">
          <strong>
            <p>Create new appointment</p>
          </strong>
          <div className="setter-box">
            <p>Title</p>
            <input
              type="text"
              className="select-datetime"
              placeholder="Enter Title"
              onChange={(evt) => {
                setAppointmentText(evt.target.value);
              }}
            />
            <p>From</p>
            <input
              type="datetime-local"
              className="select-datetime"
              onChange={(evt) => {
                setAppointmentStart(evt.target.value);
              }}
            />
            <p>Till</p>
            <input
              type="datetime-local"
              className="select-datetime"
              onChange={(evt) => {
                setAppointmentEnd(evt.target.value);
              }}
            />
            <br />
            <button
              className="save-btn"
              onClick={() => {
                createAppointment();
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
