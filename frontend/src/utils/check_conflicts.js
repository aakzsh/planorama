async function checkConflicts(events){
    console.log(events.length)
    let conflictingDates = []
    let isConflicting = false;
    // Iterate over the events, checking for conflicts.
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i];
      const nextEvent = events[i + 1];
  
      // If the current event ends after the next event starts, then there is a conflict.
      if (currentEvent.when.end_time > nextEvent.when.start_time) {
        isConflicting= true;
        conflictingDates.push(currentEvent.when.end_time)
      }
    }

    const setDates = new Set(conflictingDates)
    conflictingDates = Array.from(setDates)

    return {"isConflicting": isConflicting, "conflictingDates": conflictingDates}
}

export default checkConflicts