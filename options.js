// colors
const green = "rgb(77, 237, 77)"
const red = "rgb(234, 88, 88)"
const lightBlue = "#A7C7E7"

// elements
const body = document.querySelector("body");
const websitesTextAreaElement = document.getElementById("websites");

const remindIntervalHoursElement = document.getElementById("remindIntervalHours");
const remindIntervalMinutesElement = document.getElementById("remindIntervalMinutes");
const remindIntervalSecondsElement = document.getElementById("remindIntervalSeconds");

const resetIntervalHoursElement = document.getElementById("resetIntervalHours");
const resetIntervalMinutesElement = document.getElementById("resetIntervalMinutes");
const resetIntervalSecondsElement = document.getElementById("resetIntervalSeconds");

const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", () => {
    let remindInterval = (parseInt(remindIntervalHoursElement.value) * 60 * 60) 
                            + (parseInt(remindIntervalMinutesElement.value) * 60)
                            + parseInt(remindIntervalSecondsElement.value)

    let resetInterval = (parseInt(resetIntervalHoursElement.value) * 60 * 60) 
                            + (parseInt(resetIntervalMinutesElement.value) * 60)
                            + parseInt(resetIntervalSecondsElement.value)

    let response = undefined
    if (remindInterval == 0) {
        remindIntervalMinutesElement.value = "05"
        remindInterval = 300

        response = {status: "successful"}
    }
    if (resetInterval == 0) {
        resetIntervalHoursElement.value = "01"
        resetInterval = 3600

        response = {status: "failed"}
    }
    if (response) {
        handleResponse(response)
        return
    }

    chrome.storage.local.set({ 
        "websites": websitesTextAreaElement.value, 
        "remindInterval": remindInterval,
        "resetInterval": resetInterval
    });

    // send data update to background.js
    const message = { 
        action:"dataUpdate", 
        websites: websitesTextAreaElement.value, 
        remindSeconds: remindInterval,
        resetInterval: resetInterval
    }

    function setElementsBackground(color) {
        body.style.background = color
        websitesTextAreaElement.style.background = color

        remindIntervalHoursElement.style.background = color
        remindIntervalMinutesElement.style.background = color
        remindIntervalSecondsElement.style.background = color

        resetIntervalHoursElement.style.background = color
        resetIntervalMinutesElement.style.background = color
        resetIntervalSecondsElement.style.background = color

        saveButton.style.background = color
    }

    function handleResponse(response) {
        if (response.status == "successful") {
            setElementsBackground(green)
            setTimeout(() => {
                setElementsBackground(lightBlue)
            }, 1000)
        } else {
            setElementsBackground(red)
            setTimeout(() => {
                setElementsBackground(lightBlue)
            }, 1000)
        }
    }

    chrome.runtime.sendMessage(message, handleResponse);
});

// get content for textarea and input
chrome.storage.local.get(["websites", "remindInterval", "resetInterval"], function(result) {
    const websites = result.websites;

    websitesTextAreaElement.value = result.websites

    // time splitting to hr:mm:ss
    function splitTime(seconds) {
        const hours = Math.floor(seconds / 3600) 
        seconds = seconds - (hours * 3600)
        const minutes = Math.floor(seconds / 60) 
        seconds = seconds - (minutes * 60)

        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        }
    }
    
    const remindIntervalTime = splitTime(result.remindInterval)
    remindIntervalHoursElement.value = remindIntervalTime.hours
    remindIntervalMinutesElement.value = remindIntervalTime.minutes
    remindIntervalSecondsElement.value = remindIntervalTime.seconds

    const resetIntervalTime = splitTime(result.resetInterval)
    resetIntervalHoursElement.value = resetIntervalTime.hours
    resetIntervalMinutesElement.value = resetIntervalTime.minutes
    resetIntervalSecondsElement.value = resetIntervalTime.seconds
});

function validateInput(element, limit) {
    if (element.value > limit
        || element.value.includes(".")
        || element.value.length > 2
        || isNaN(element.value)) {
            element.value = "00"
    }
}

function setupInputListeners(inputId, limit) {
    const inputElement = document.getElementById(inputId);
    
    inputElement.addEventListener("input", function() {
        validateInput(inputElement, limit);
    });
    
    inputElement.addEventListener("click", function() {
        inputElement.selectionStart = 0;
        inputElement.selectionEnd = 2;
    });

    inputElement.addEventListener("blur", function() {
        if (inputElement.value === "") {
            inputElement.value = "00"
        }
    });
}

setupInputListeners("remindIntervalHours", 99);
setupInputListeners("remindIntervalMinutes", 59);
setupInputListeners("remindIntervalSeconds", 59);

setupInputListeners("resetIntervalHours", 99);
setupInputListeners("resetIntervalMinutes", 59);
setupInputListeners("resetIntervalSeconds", 59);