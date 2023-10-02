import * as dateFns from "date-fns";
async function getDayEvents(val, events){
    let ans = []
    
    // console.log("date hai ",val)
    // console.log("lmo")
    console.log(events[0].when.start_time)
    for(let i=0;i<events.length;i++){
        let checkDate = new Date(events[i].when.start_time*1000)
        if(dateFns.isSameDay(val, checkDate)){
            ans.push(events[i])
        }
    }
    return ans
}

export default getDayEvents