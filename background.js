let timeTable = {}

setInterval(function() {
    // time ticker
    for(const key in timeTable) {
        timeTable[key].responded = false
    }

    // send time table to all tabs
    chrome.tabs.query({}, function(tabs) {
        function handleReponse(response) {
            console.log("response", response)

            /*  
                no response, meaning tab was closed

                don't remove tab data because user
                can go back to the same tab domain
                time should just continue
            */ 
            if (response.url == undefined) {
                return
            }

            // same tab domain already responded
            if (timeTable[urlKey].responded == true) {
                return
            }
            
            timeTable[urlKey].time += 1
            timeTable[urlKey].responded = true
        }

        for (let i=0; i<tabs.length; ++i) {
            console.log("timeTable", timeTable)
            console.log("tabs", tabs[i].url)
            console.log("timeTable[tabs]", timeTable[tabs[i].url])

            if (timeTable[tabs[i].url] != undefined) {
                message = {
                    time: timeTable[tabs[i].url].time
                }
    
                chrome.tabs.sendMessage(tabs[i].id, message, handleReponse);
            }
        }
    });
}, 1000)

// new tab listener
chrome.runtime.onMessage.addListener((message) => {
    console.log("message", message)
    console.log("pre-update", timeTable)

    // add new tab to time table
    if (!(message.url in timeTable)) {
        timeTable[message.url] = {
            time: 0,
            responded: false
        }
    }

    console.log("post-update", timeTable)
});