/**
 * Function to decode escaped hexadecimal sequences in a string if present.
 * @param {string} inputText - The text that may contain escaped sequences.
 * @returns {string} - The processed text with proper characters.
 */
export function decodeEscapedString(inputText: string): string {
    // Check if the text contains any escaped sequences (\xhh)
    const hasEscapedSequences = /\\x[0-9A-Fa-f]{2}/.test(inputText);
    
    if (hasEscapedSequences) {
        // Remove incomplete escape sequences at the end
        inputText = inputText.replace(/(\\x[0-9A-Fa-f]?|\r|\n)*$/, '');
        
        // Decode escaped hexadecimal sequences (\xhh)
        let decodedText = inputText.replace(/\\x([0-9A-Fa-f]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        });
        
        // Handle other escape sequences like \r, \n, etc.
        decodedText = decodedText.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
        
        // Convert the string to a Buffer using 'latin1' encoding
        let buffer = Buffer.from(decodedText, 'latin1');
        
        // Decode the buffer into a UTF-8 string
        let finalText = buffer.toString('utf8');
        
        return finalText;
    } else {
        // If no escaped sequences, return the text as is
        return inputText;
    }
}