const url = window.location.href

let intervalPointer = null

function startTimer(remindSeconds) {
    const startTime = new Date()

    const element = document.createElement("p");

    element.style.position = "fixed";
    element.style.top = "10px";
    element.style.right = "10px";
    element.style.backgroundColor = "white";
    element.style.padding = "2px"
    element.style.fontSize = "20px"
    element.style.zIndex = "9999"

    document.body.appendChild(element);

    let isRemindingUser = false;

    function remindUser() {
        console.log("remindUser()")

        isRemindingUser = true

        element.style.top = "40%"
        if (element.style.left == "10px") {
            element.style.left = "40%"
            element.style.right = "auto"
        } else {
            element.style.left = "auto"
            element.style.right = "40%"
        }
        element.style.fontSize = "50px"
        element.style.padding = "10px"

        element.style.backgroundColor = "red"
        setTimeout(function() {
            element.style.backgroundColor = "white"
        }, 500)
        setTimeout(function() {
            element.style.backgroundColor = "red"
        }, 1000)
        setTimeout(function() {
            element.style.backgroundColor = "white"
        }, 1500)
        setTimeout(function() {
            element.style.backgroundColor = "red"
        }, 2000)
        setTimeout(function() {
            element.style.backgroundColor = "white"
        }, 2500)
        setTimeout(function() {
            element.style.backgroundColor = "red"
        }, 3000)
        setTimeout(function() {
            element.style.backgroundColor = "white"
        }, 3500)
        setTimeout(function() {
            element.style.backgroundColor = "red"
        }, 4000)
        setTimeout(function() {
            element.style.top = "10px";
            if (element.style.left == "40%") {
                element.style.left = "10px"
                element.style.right = "auto"
            } else {
                element.style.left = "auto"
                element.style.right = "10px"
            };
            element.style.fontSize = "20px"
            element.style.padding = "2px"
            element.style.backgroundColor = "white"

            isRemindingUser = false;
        }, 4500)
    }

    function updateTime() {
        const currentTime = new Date();
        const elapsedTime = new Date(currentTime.getTime() - startTime.getTime())
        // element.innerHTML = elapsedTime.getSeconds().toString().padStart(2, '0');

        const hours = Math.floor(elapsedTime / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000).toString().padStart(2, '0');

        element.innerHTML = `${hours}:${minutes}:${seconds}`;

        // console.log(Math.floor(elapsedTime / 1000) % remindSeconds)

        if ((Math.floor(elapsedTime / 1000) % remindSeconds) == 0) {
            remindUser()
        }
    }

    intervalPointer = setInterval(updateTime, 1000);

    function handleMouseEnter() {
        if (isRemindingUser) {
            return
        }

        if (element.style.right == "auto") {
            element.style.right = "10px";
            element.style.left = "auto";
        } else {
            element.style.right = "auto";
            element.style.left = "10px";
        }
    }
    element.addEventListener("mouseenter", handleMouseEnter);
}

function extractDomain(url) {
    // Remove protocol (http://, https://) and www (if present)
    var domain = url.replace(/(https?:\/\/)?(www\.)?/, '');
    
    // Remove path and query parameters
    domain = domain.split('/')[0];
    
    return domain;
}

function getData() {
    chrome.runtime.sendMessage({ action: 'getData', url: extractDomain(url) }, function(response) {
        console.log(response)

        if (response.isIncluded) {
            startTimer(response.remindSeconds)
        }
    });
}

getData()

// data change message listener
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('Message received:', message);

    if (message.restart) {
        clearInterval(intervalPointer)
        getData()
    }
});