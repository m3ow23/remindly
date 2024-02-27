const url = window.location.href;

// onload send url to background.js
const onloadMessage = { 
    action:"newTab", 
    url: url 
}

function handleOnloadReponse(response) {
    // work around to wake up sleeping listener of background.js after reopening browser
    if (response === undefined) {
        setTimeout(
            chrome.runtime.sendMessage(onloadMessage, handleOnloadReponse),
            1000
        )
        return
    }

    if (response.isWebsiteOnList) {
        // timer element
        const backdropBlur = document.createElement("div");
        backdropBlur.style.position = "fixed"
        backdropBlur.style.width = "110vw"
        backdropBlur.style.height = "110vh"
        backdropBlur.style.backdropFilter = "blur(0px)"
        backdropBlur.style.zIndex = "9998"
        backdropBlur.style.backgroundColor = "rgb(0, 0, 0, 0)"
        backdropBlur.style.top = 0
        backdropBlur.style.left = 0
        backdropBlur.style.pointerEvents = "none"
        backdropBlur.style.transition = "all 0.5s ease"

        const timer = document.createElement("p");
        timer.style.position = "fixed";
        timer.style.top = "10px";
        timer.style.right = "10px";
        timer.style.backgroundColor = "white";
        timer.style.padding = "2px"
        timer.style.fontSize = "20px"
        timer.style.zIndex = "9999"
        timer.style.color = "black"
        timer.style.transition = "all 0.5s ease"

        document.body.appendChild(timer);
        document.body.appendChild(backdropBlur);

        let isRemindingUser = false;

        function remindUser() {
            isRemindingUser = true

            backdropBlur.style.backdropFilter = "blur(20px)"
            backdropBlur.style.backgroundColor = "rgb(0, 0, 0, .75)"

            timer.style.top = "40%"
            if (timer.style.left == "10px") {
                timer.style.left = "40%"
                timer.style.right = "auto"
            } else {
                timer.style.left = "auto"
                timer.style.right = "40%"
            }
            timer.style.fontSize = "50px"
            timer.style.padding = "10px"

            timer.style.backgroundColor = "red"
            setTimeout(function() {
                timer.style.backgroundColor = "white"
            }, 500)
            setTimeout(function() {
                timer.style.backgroundColor = "red"
            }, 1000)
            setTimeout(function() {
                timer.style.backgroundColor = "white"
            }, 1500)
            setTimeout(function() {
                timer.style.backgroundColor = "red"
            }, 2000)
            setTimeout(function() {
                timer.style.backgroundColor = "white"
            }, 2500)
            setTimeout(function() {
                timer.style.backgroundColor = "red"
            }, 3000)
            setTimeout(function() {
                timer.style.backgroundColor = "white"
            }, 3500)
            setTimeout(function() {
                timer.style.backgroundColor = "red"
            }, 4000)
            setTimeout(function() {
                timer.style.top = "10px";
                if (timer.style.left == "40%") {
                    timer.style.left = "10px"
                    timer.style.right = "auto"
                } else {
                    timer.style.left = "auto"
                    timer.style.right = "10px"
                };
                timer.style.fontSize = "20px"
                timer.style.padding = "2px"
                timer.style.backgroundColor = "white"

                backdropBlur.style.backdropFilter = "blur(0px)"
                backdropBlur.style.backgroundColor = "rgb(0, 0, 0, 0)"
            }, 4500)
            setTimeout(function() {
                isRemindingUser = false;
            }, 5000)
        }

        // time update and respond with url
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            // send URL as reponse to let background.js that tab is opened 
            sendResponse({
                url: url
            })

            const hours = Math.floor(message.time / (60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((message.time % (60 * 60)) / (60)).toString().padStart(2, '0');
            const seconds = Math.floor((message.time % (60))).toString().padStart(2, '0');

            timer.innerHTML = `${hours}:${minutes}:${seconds}`;

            if ((Math.floor(message.time) % message.remindInterval) == 0 
                    && message.time != 0) {
                remindUser()
            }
        });

        // mouse hover interaction
        function handleMouseEnter() {
            if (isRemindingUser) {
                return
            }

            if (timer.style.right == "auto") {
                timer.style.right = "10px";
                timer.style.left = "auto";
            } else {
                timer.style.right = "auto";
                timer.style.left = "10px";
            }
        }
        timer.addEventListener("mouseenter", handleMouseEnter);
    }
}

chrome.runtime.sendMessage(onloadMessage, handleOnloadReponse);