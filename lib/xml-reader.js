class XmlReader {
    static readXmlFile(file, onLoad) {
        var file = file;
        var fileContents;
        var xmlDoc;
        var fileReader = new FileReader();
        var domParser = new DOMParser();
        
        fileReader.onloadend = function (e) {
            fileContents = fileReader.result;
            xmlDoc = domParser.parseFromString(fileContents, "application/xml");
            return onLoad(e, xmlDoc);
        };

        /*fileReader.onerror = function (e) {
            console.log(e);
        }*/

        fileReader.readAsText(file);
    }
}