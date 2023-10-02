import React, { useState, useEffect } from "react";
import { useNylas } from "@nylas/nylas-react";
import NylasLogin from "./NylasLogin";
import Layout from "./components/Layout";
import Home from "./Home/Home";
import ChoosePreferences from "./components/Preferences/ChoosePreferences";
import "./styles/App.css";

function App() {
  const nylas = useNylas();
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [preferences, setPreferences] = useState(false);
  const [firstCardChecked, setFirstCardChecked] = useState(true);
  const [index, setIndex] = useState(0);
  const [preferencesArray, setPreferencesArray] = useState([0,0,0,0,0,0]);

  const choices = [
    ["Coffee meet with Jim", "Business plan discussion with Alex"],
    ["Production release meet","Daily Standup meet"],
    ["Going for daughter's school admission","Going to grocery store"],
    ["University internship report submission","Long drive to nevada"],
    ["watching favourite TV show on TV","going to favourite artist's music concert"],
    ["meeting regarding bug fixes","Professional photoshoot for business magazine"],
  ];


  useEffect(() => {
    if (!nylas) {
      return;
    }

    // Handle the code that is passed in the query params from Nylas after a successful login
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      nylas
        .exchangeCodeFromUrlForToken()
        .then((user) => {
          const { id, accessToken } = JSON.parse(user);
          setUserId(id);
          sessionStorage.setItem("userId", id);
          sessionStorage.setItem("accessToken", accessToken);
          // console.log("token is", accessToken)
        })
        .catch((error) => {
          console.error("An error occurred parsing the response:", error);
        });
    }
  }, [nylas]);

  useEffect(() => {
    const userIdString = sessionStorage.getItem("userId");
    const userEmail = sessionStorage.getItem("userEmail");
    const isUserPreferenceRequired = sessionStorage.getItem("isUserPreferenceRequired");
    if (userIdString) {
      setUserId(userIdString);
    }
    if (userEmail) {
      setUserEmail(userEmail);
    }
    if(!isUserPreferenceRequired)
    {
      setPreferences(true);
    }
  }, []);

  useEffect(() => {
    if (userId?.length) {
      window.history.replaceState({}, "", `/?userId=${userId}`);
    } else {
      window.history.replaceState({}, "", "/");
    }
  }, [userId]);

  const disconnectUser = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("accessToken");
    setUserId("");
    setUserEmail("");
  };

  useEffect(() => {
    if(index == choices.length)
    {
      sessionStorage.setItem('preferences', JSON.stringify(preferencesArray))
      sessionStorage.setItem('isUserPreferenceRequired', "false")
      setPreferences(false)
    }
  }, [index])
  
  function handleNextClick() {
    
    setIndex(index+1)
    let temp = preferencesArray;
    temp[index] = !firstCardChecked;
    setPreferencesArray(temp); 
  }

  const handleChildRadioChange = (newSelected) => {
    setFirstCardChecked(newSelected);
  };

  return (
    <Layout showMenu={!!userId} disconnectUser={disconnectUser}>
      {!userId ? (
        <NylasLogin email={userEmail} setEmail={setUserEmail} />
      ) : (
        <>
          {preferences ? (
            <div className="preferences-container">
              <ChoosePreferences
                title1={index < choices.length ? choices[index][0] : choices[choices.length - 1][0]}
                title2={index < choices.length ? choices[index][1] : choices[choices.length - 1][1]}
                handleChildRadioChange={handleChildRadioChange}
              ></ChoosePreferences>
              <br />
              <br />
              <button className="nextbtn" onClick={handleNextClick}>
                {index < choices.length ? "Next" : "Submit Preferences"}
              </button>
            </div>
          ) : (
            <Home />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
