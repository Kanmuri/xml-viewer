class XmlViewerLocalization {
    constructor(l8nRegion) {
        this.l8nRegion = l8nRegion;
        this.strings = {};

        //Loop over all the strings in the default set and grab the default,
        //then check to see if each string has been localized for the selected region and if so,
        //replace the default string with the localized string
        for (var stringName in XmlViewerLocalization.strings.default) {
            this.strings[stringName] = XmlViewerLocalization.strings.default[stringName];

            if (XmlViewerLocalization.strings.hasOwnProperty(this.l8nRegion)
            && XmlViewerLocalization.strings[this.l8nRegion].hasOwnProperty(stringName)) {
                this.strings[stringName].string = XmlViewerLocalization.strings[this.l8nRegion][stringName].string;
            }
        }
    }

    interpolatel8nString(stringName, substitutions) {
        var l8nString = this.getl8nString(stringName);
        var interpString = l8nString.string;
        var subst;

        if(l8nString.substitutions !== undefined && l8nString instanceof Array) {
            if(substitutions !== undefined) {
                subst = substitutions;
            }
            else {
                subst = {};
            }

            //The idea here is that the strings to substitute will be passed in as an object
            //this object will have all the substitution strings in it, and will be referenced
            //in the strings as "${subst.replacementName}"

            //The original plan was to eval() the strings inside backquotes to get dynamic interpolation;
            //however, there are possible security implications to that approach and I think a much more limited
            //version should work instead

            //If there are substitutions in the string, there should be a list of their names as part of the
            //definition; loop over that list and replace the placeholder with the substitution value
            for (var substName in l8nString.substitutions) {
                var substValue = subst.hasOwnProperty(substName) ? subst[substName] : "";
                var regexpString = `\$\{subst.${substName}\}`;
                var regExp = new RegExp(regexpString, "g");
                interpString = interpString.replace(regExp, substValue);
            }
        }

        return interpString;
    }

    getl8nString(stringName) {
        if(this.strings.hasOwnProperty(stringName)) {
            return this.strings[stringName];
        }
        else {
            //This is thrown if the stringName is not found in the cached set of l8n strings for this instance.
            //This means that it wasn't in the set of localization strings at all, regardless of the region setting.
            //This is because when the cached set of localized strings is created for this instance (above in the constructor),
            //the value for the default set is inserted if there is no localized version found for the given region.
            throw `Localization string not found. Name: "${stringName}"; Region: ${this.l8nRegion}`;
        }
    }
}

XmlViewerLocalization.strings = {
    default: {
        nodeNameLabel: {
            string: "Node Name:"
        }
    }
};

class XmlViewer {
    constructor(l8nRegion) {
        this.l8n = new XmlViewerLocalization(l8nRegion);
        Vue.component('node-display', XmlViewer.components.nodeDisplay);
    }

    renderXml(xmlDoc, rootSelector) {
        var vueOptions = {
            el: rootSelector,
            data: {
                rootNode: xmlDoc.documentElement,
                l8n: this.l8n
            }
        };

        new Vue(vueOptions);
    }
}

XmlViewer.components = {};
XmlViewer.components.nodeDisplay = {
    props: ['node', 'l8n'],
    template: `
    <div class="node-display-wrapper">
        <div class="node-name">
            <span class="node-name-label">{{l8n.interpolatel8nString("nodeNameLabel")}}</span> <span class="node-name-text">{{node.tagName}}</span>
        </div>
    </div>
    `
};