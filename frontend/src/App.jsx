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
  const [preferences, setPreferences] = useState(true);
  const [firstCardChecked, setFirstCardChecked] = useState(true)

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
    if (userIdString) {
      setUserId(userIdString);
    }
    if (userEmail) {
      setUserEmail(userEmail);
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

  function handleNextClick () {
    
  }

  const handleChildRadioChange = (newSelected) => {
    console.log("change reflected", newSelected)
    setFirstCardChecked(newSelected);
  }



  return (
    <Layout showMenu={!!userId} disconnectUser={disconnectUser}>
      {!userId ? (
        <NylasLogin email={userEmail} setEmail={setUserEmail} />
      ) : (
        <>
          {preferences ? (
            <div className="preferences-container">
              <ChoosePreferences title1={"t1"} title2={"t2"} handleChildRadioChange={handleChildRadioChange}></ChoosePreferences>
              <br /><br />
              <button className="nextbtn" onClick={handleNextClick}>Next</button>
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
