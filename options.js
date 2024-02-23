const body = document.querySelector("body");
const websitesTextArea = document.getElementById("websites");
const remindSecondsInput = document.getElementById("remindSeconds");
const saveButton = document.getElementById("saveButton");
const websitesElement = document.getElementById("websites")
const remindSecondsElement = document.getElementById("remindSeconds")
const green = "rgb(77, 237, 77)"
const red = "rgb(234, 88, 88)"
const lightBlue = "#A7C7E7"
saveButton.addEventListener("click", () => {
    chrome.storage.local.set({ "websites": websitesElement.value, "remindSeconds": remindSecondsElement.value });

    // send data update to background.js
    const message = { 
        action:"dataUpdate", 
        websites: websitesElement.value, 
        remindSeconds: remindSecondsElement.value 
    }

    function handleResponse(response) {
        if (response.status == "successful") {
            body.style.background = green
            websitesTextArea.style.background = green
            remindSecondsInput.style.background = green
            saveButton.style.background = green
            setTimeout(() => {
                body.style.background = lightBlue
                websitesTextArea.style.background = lightBlue
                remindSecondsInput.style.background = lightBlue
                saveButton.style.background = lightBlue
            }, 1000)
        } else {
            body.style.background = red
            websitesTextArea.style.background = red
            remindSecondsInput.style.background = red
            saveButton.style.background = red
            setTimeout(() => {
                body.style.background = lightBlue
                websitesTextArea.style.background = lightBlue
                remindSecondsInput.style.background = lightBlue
                saveButton.style.background = lightBlue
            }, 1000)
        }
    }

    chrome.runtime.sendMessage(message, handleResponse);
});

// get content for textarea and input
chrome.storage.local.get(["websites", "remindSeconds"], function(result) {
    const websites = result.websites;
    const remindSeconds = result.remindSeconds;
    
    websitesElement.value = websites
    remindSecondsElement.value = remindSeconds
});

const remindSecondsInputElement = document.getElementById("remindSeconds")
remindSecondsInputElement.addEventListener("input", function() {
    let value = parseFloat(this.value);

    if (value < 0) {
        this.value = 0
    }
})