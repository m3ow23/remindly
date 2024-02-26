const isDebugging = true

/**
 * 
 * @param {*} message 
 * Can accept an object that displays the variable name and data. 
 */
export function log(message) {
    if (!isDebugging) {
        return
    }
    
    if (typeof message == typeof {}
            && Object.keys(message).length == 1) {
        const key = Object.keys(message)[0]
        console.log(
            key, 
            message[key]
        )

        return
    }

    console.log(message)
}