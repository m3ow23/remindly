const url = window.location.href.replace(/(https?:\/\/)?(www\.)?/, '');

// onload send url to background.js
chrome.runtime.sendMessage({ url: url });

// time update and respond with url
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)

    sendResponse({
        url: url
    })
});