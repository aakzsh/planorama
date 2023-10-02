import { useEffect, useState } from "react";
import Calendar from "../Agenda/Calendar";
import "./Home.css";
import alerticon from "../images/alert-triangle.svg"

const Home = () => {
  const [isConflicting, setConflicting] = useState(true);
  const handleChildStateUpdate = (val) => {
    setConflicting(val);
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

  return (
    <div className="homescreen">
      <div className="calendar-and-alert">
        <div className="calendar-area">
          <Calendar handleChildStateUpdate={handleChildStateUpdate} />
        </div>
        {isConflicting ? (
          <div className="alert-box" style={{ backgroundColor: "#FB7575" }}>
            <div class="parent">
            </div>

            <p>
              Alert: You have conflicting meetings, click here to view and fix!
            </p>
          </div>
        ) : (
          <div className="alert-box" style={{ backgroundColor: "#79EB44" }}>
            <p>No issues: All meetings are fine and not conflicting!</p>
          </div>
        )}
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
              <input type="text" className="working-hrs" placeholder="HH" />
              <input type="text" className="working-hrs" placeholder="MM" />
              <strong>
                <p>TO</p>
              </strong>
              <input type="text" className="working-hrs" placeholder="HH" />
              <input type="text" className="working-hrs" placeholder="MM" />
            </div>
            <button className="save-btn">Save</button>
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
            />
            <p>From</p>
            <input type="datetime-local" className="select-datetime" />
            <p>Till</p>
            <input type="datetime-local" className="select-datetime" />
            <br />
            <button className="save-btn">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
