// defaults values
// these values needs to be global
let websites = "facebook.com\nyoutube.com\ntwitch.tv"
let remindInterval = 300 // 5 minutes

chrome.storage.local.get(["websites", "timeTable", "remindInterval", "resetInterval", "lastUpdateTimestamp"], function (result) {
    // defaults values
    let timeTable = {}
    let lastUpdateTimestamp = new Date()
    let resetInterval = 3600 // 1 hours

    // reset all time in timeTable to 0
    function resetTimeTable() {
        for (const key in timeTable) {
            timeTable[key].time = 0
        }
    }

    let localStorageData = {}

    // helper function to set default values if not found in result
    function setDefaultIfUndefined(key, defaultValue) {
        if (result[key] !== undefined) {
            return result[key];
        }

        localStorageData[key] = defaultValue;
        return defaultValue
    }

    // set default values or retrieve from result
    websites = setDefaultIfUndefined("websites", websites);
    timeTable = JSON.parse(setDefaultIfUndefined("timeTable", JSON.stringify(timeTable)));
    remindInterval = setDefaultIfUndefined("remindInterval", remindInterval);
    resetInterval = setDefaultIfUndefined("resetInterval", resetInterval);
    lastUpdateTimestamp = new Date(setDefaultIfUndefined("lastUpdateTimestamp", lastUpdateTimestamp.toISOString()));

    // update timeTable if needed based on lastUpdateTimestamp
    const elapsedTimeMilliseconds = new Date().getTime() - new Date(lastUpdateTimestamp).getTime();
    if (elapsedTimeMilliseconds >= resetInterval * 1000) {
        resetTimeTable();
    }

    // update localStorageData if needed
    if (Object.keys(localStorageData).length !== 0) {
        chrome.storage.local.set(localStorageData)
    }

    // remove protocols such as http, https, and www
    function parseUrlInWebsiteList(url) {
        for (const website of websites.split("\n")) {
            if (url.includes(website)) {

                return website
            }
        }

        return undefined
    }

    setInterval(function () {
        // time ticker
        for (const key in timeTable) {
            timeTable[key].responded = false
        }

        // send time table to all tabs
        chrome.tabs.query({}, function (tabs) {
            function handleReponse(response) {
                // check if there is valid response
                // websites respond even while loading returning an undefined response
                if (response == undefined) {
                    return
                }

                const parsedUrl = parseUrlInWebsiteList(response.url)

                // same tab domain already responded
                if (timeTable[parsedUrl].responded == true) {
                    return
                }

                timeTable[parsedUrl].time += 1
                timeTable[parsedUrl].responded = true

                // reset timeTable if elapsedTime is beyond reset interval
                const elapsedTimeMilliseconds = new Date().getTime() - lastUpdateTimestamp.getTime();
                if (elapsedTimeMilliseconds >= resetInterval * 1000) {
                    resetTimeTable()
                } 

                // update timeTable and lastUpdateTimeStamp in local storage
                lastUpdateTimestamp = new Date()
                chrome.storage.local.set({ 
                    "timeTable": JSON.stringify(timeTable),
                    "lastUpdateTimestamp": lastUpdateTimestamp.toISOString()
                });
            }

            for (let i = 0; i < tabs.length; i++) {
                const parsedUrl = parseUrlInWebsiteList(tabs[i].url)

                // skip tab if not included in timeTable
                if (timeTable[parsedUrl] == undefined) {
                    continue
                }

                if (parsedUrl != undefined) {
                    const message = {
                        time: timeTable[parsedUrl].time,
                        remindInterval: remindInterval
                    }

                    chrome.tabs.sendMessage(tabs[i].id, message, handleReponse);
                }
            }
        });
    }, 1000)

    // new tab and data update listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // check if website is on user-specified list
        function isWebsiteOnList(url) {

            return parseUrlInWebsiteList(url) ? true : false
        }

        function handleCheckWebsiteInTimeTable(url) {
            const parsedUrl = parseUrlInWebsiteList(url)

            if (!(parsedUrl in timeTable)) {
                timeTable[parsedUrl] = {
                    time: 0,
                    responded: false
                }
            }
        }

        if (message.action == "newTab") {
            // add new tab to time table
            if (isWebsiteOnList(message.url)) {
                handleCheckWebsiteInTimeTable(message.url)

                sendResponse({
                    isWebsiteOnList: true
                })
            } else {
                sendResponse({
                    isWebsiteOnList: false
                })
            }
        } else if (message.action == "dataUpdate") {
            websites = message.websites.split("\n")
            remindInterval = message.remindInterval

            sendResponse({
                status: "successful"
            })
        }
    });
});
