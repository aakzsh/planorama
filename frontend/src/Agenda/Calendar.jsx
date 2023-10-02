import React, { useEffect, useState } from "react";
import * as dateFns from "date-fns";
import axios from "axios";
import moment from "moment";
import closeicon from "../images/x.svg";

import "./Calendar.css";
import checkConflicts from "../utils/check_conflicts";
import getDayEvents from "../utils/get_day_events";
import Loading from "../components/loading/Loading";

const Calendar = ({ handleChildStateUpdate }) => {
  const [isLoading, setLoading] = useState(false);
  const [globalConflicting, setGlobalConflicting] = useState(false);
  const [conflictingDates, setConflictingDates] = useState([]);
  const [dayAgendaval, openDayAgenda] = useState(false);
  const [dayData, setdayData] = useState([]);
  const times = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
  ];

  async function setDay(dateval) {
    const daydata = await getDayEvents(dateval, staticEvents);
    setdayData(daydata);
    openDayAgenda(true);
    console.log(daydata);
  }

  const [staticEvents, setStaticEvents] = useState([]);
  useEffect(() => {
    async function getEvents() {
      setLoading(true);
      const token = await sessionStorage.getItem("accessToken");
      const response = await axios.get(
        "http://localhost:9000/nylas/get-calendar-events/" + token
      );
      setStaticEvents(response.data.data);
      const conflicts = await checkingConflicts(response.data.data);
      sessionStorage.setItem("globalConflicting", conflicts.isConflicting);
      setLoading(false);
    }
    async function checkingConflicts(x) {
      const conflicts = await checkConflicts(x);
      console.log(conflicts);
      setGlobalConflicting(conflicts.isConflicting);
      handleChildStateUpdate(conflicts.isConflicting);
      setConflictingDates(conflicts.conflictingDates);
      return conflicts;
    }
    getEvents();
  }, []);

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
            <span>
              {isLoading
                ? "fetching data..."
                : dateFns.format(currentDate, dateFormat)}
            </span>
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
  const cells = () => {
    const monthStart = dateFns.startOfMonth(currentDate);
    const monthEnd = dateFns.endOfMonth(monthStart);
    const startDate = dateFns.startOfWeek(monthStart);
    const endDate = dateFns.endOfWeek(monthEnd);
    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;

    let formattedDate = "";
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = dateFns.format(day, dateFormat);
        let class_name = "";
        const cloneDay = day;
        if (!dateFns.isSameMonth(day, monthStart)) {
          class_name = "disabled";
        } else {
          // console.log(day)
          let colliding = false;
          let found = false;
          for (let i = 0; i < staticEvents.length; i++) {
            let start_day = new Date(staticEvents[i].when.start_time * 1000);

            if (dateFns.isSameDay(day, start_day)) {
              class_name = "eventlinedup";
              for (let j = 0; j < conflictingDates.length; j++) {
                let conflicting_day = new Date(conflictingDates[j] * 1000);
                if (dateFns.isSameDay(day, conflicting_day)) {
                  colliding = true;
                }
              }
              found = true;
              break;
            }
          }
          if (colliding && found) {
            class_name = "conflictingevent";
          }
        }

        if (dateFns.isSameDay(day, selectedDate)) {
          class_name += " selected";
        }

        days.push(
          <div
            onClick={() => {
              setDay(cloneDay);
              openDayAgenda(true);
            }}
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
      }
      rows.push(
        <div className="row" key={day}>
          {" "}
          {days}{" "}
        </div>
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

  const onDateClick = (day) => {
    setSelectedDate(day);
  };

  return (
    <>
      {!dayAgendaval ? (
        isLoading ? (
          <Loading />
        ) : (
          <div className="calendar">
            <div>{header()}</div>
            <div>{days()}</div>
            <div>{cells()}</div>
          </div>
        )
      ) : (
        <div>
          <img
            src={closeicon}
            onClick={() => {
              openDayAgenda(false);
            }}
            className="closebtn"
            alt=""
          />
          <div className="timeseriesparent">
            <div className="timeseries">
              <h3>
                {dayData.length === 1
                  ? `${dayData.length} Event for the day!`
                  : `${dayData.length} Events for the day!`}
              </h3>
              <div className="time24hr">
                {times.map((el) => {
                  return <div className="timetext"><p className="timetextp">{el}</p></div>;
                })}
              </div>
              <br />
              {dayData.map((element) => {
                let firstTime = new Date(
                  element.when.start_time * 1000
                ).setHours(0, 0, 0, 0);
                let lastTime = new Date(
                  element.when.start_time * 1000
                ).setHours(23, 59, 59, 999);
                let starttime = element.when.start_time * 1000;
                let endTime = element.when.end_time * 1000;
                let total_length = lastTime - firstTime;
                let left_percent = (starttime - firstTime) / total_length;
                console.log("left percent ", left_percent);
                console.log("total length ", total_length);
                let right_percent = (lastTime - endTime) / total_length;

                let left =
                  ((lastTime -
                    firstTime -
                    (lastTime - element.when.start_time)) /
                    (lastTime - firstTime)) *
                  10;
                // <p>{element.toString()}</p>
                return (
                  <div>
                    <p className="meet-title">{element.title}</p>
                    <div className="timeline-axis">
                      <div
                        className="timetile"
                        style={{
                          marginLeft:  left_percent * 100 + "%",
                          marginRight: right_percent * 100 + "%",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
