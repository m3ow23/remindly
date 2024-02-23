const buttonElement = document.querySelector("button")
buttonElement.addEventListener("click", function() {
    chrome.runtime.openOptionsPage()
})