mergeInto(LibraryManager.library, {
    WalletCheck: function(){
        var returnStr
        try {
            // get address from metamask
            returnStr = web3.currentProvider.selectedAddress
        } catch (e) {
            returnStr = ""
        }
        
        doGreet();
        
        var bufferSize = lengthBytesUTF8(returnStr) + 1;
        var buffer = _malloc(bufferSize);
        stringToUTF8(returnStr, buffer, bufferSize);
        return buffer;
    }
})