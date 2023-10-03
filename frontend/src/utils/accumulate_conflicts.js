async function accumulateConflicts(events){
    let ans = []
    console.log(events.length)
    if(events.length<1){
        return ans
    }
    
    let ins = [events[0]]
    let end = events[0].when.end_time;

    // Iterate over the events, checking for conflicts.
    for (let i = 1; i < events.length; i++) {
        if(events[i].when.start_time>=end){
            if(ins.length>1){
                ans.push(ins)
            }
            ins = [events[i]]
            end = Math.max(end, events[i].when.end_time)
        }
        else{
            ins.push(events[i])
            end = Math.max(end, events[i].when.end_time)
        }

        
    }
    ans.push(ins)

    console.log("ans is ", ans)

    return ans
}

export default accumulateConflicts