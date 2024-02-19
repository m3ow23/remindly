const saveButton = document.getElementById("saveButton");
const websites = document.getElementById("websites"); 
const remindSeconds = document.getElementById("remindSeconds");
saveButton.addEventListener("click", () => {
    console.log('saveButton()')

    chrome.storage.local.set({ "websites": websites.value, "remindSeconds": remindSeconds.value });

    saveButton.style.background = 'rgb(77, 237, 77)'
    setTimeout(() => {
        saveButton.style.background = 'white'
    }, 1000)

    // send restart message to every timer process
    chrome.runtime.sendMessage({ action: 'dataUpdate' });
});

// get content for textarea and input
const websitesElement = document.getElementById("websites")
const remindSecondsElement = document.getElementById("remindSeconds")
chrome.storage.local.get(["websites", "remindSeconds"], function(result) {
    console.log(result)
    
    const websites = result.websites;
    const remindSeconds = result.remindSeconds;
    
    console.log(result.websites)
    console.log(result.remindSeconds)

    websitesElement.value = websites
    remindSecondsElement.value = remindSeconds
});