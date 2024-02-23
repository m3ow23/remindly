let websites = undefined
let remindSeconds = undefined

chrome.storage.local.get(["websites", "remindSeconds"], function (result) {
    websites = result.websites.split("\n");
    remindSeconds = result.remindSeconds;

    let timeTable = {}

    // check if website is on user-specified list
    function parseUrlInWebsiteList(url) {
        for (const website of websites) {
            if (url.includes(website)) {
                return website
            }
        }

        return undefined
    }

    // check if website is on user-specified list
    function isWebsiteOnList(url) {
        return parseUrlInWebsiteList(url) ? true : false
    }

    setInterval(function () {
        // time ticker
        for (const key in timeTable) {
            timeTable[key].responded = false
        }

        // send time table to all tabs
        chrome.tabs.query({}, function (tabs) {
            function handleReponse(response) {
                const parsedUrl = parseUrlInWebsiteList(response.url)

                // same tab domain already responded
                if (timeTable[parsedUrl].responded == true) {
                    return
                }

                timeTable[parsedUrl].time += 1
                timeTable[parsedUrl].responded = true
            }

            for (let i = 0; i < tabs.length; i++) {
                const parsedUrl = parseUrlInWebsiteList(tabs[i].url)

                // skip tab if not included in timeTable
                if (timeTable[parsedUrl] == undefined) {
                    continue
                }

                if (parsedUrl != undefined) {
                    message = {
                        time: timeTable[parsedUrl].time,
                        remindSeconds: remindSeconds
                    }

                    chrome.tabs.sendMessage(tabs[i].id, message, handleReponse);
                }
            }
        });
    }, 1000)

    // new tab and data update listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
            remindSeconds = message.remindSeconds

            sendResponse({
                status: "successful"
            })
        }
    });
});
