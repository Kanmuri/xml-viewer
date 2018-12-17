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
        },
        nodeAttributesLabel: {
            string: "Attributes"
        },
        nodeAttributeNameLabel: {
            string: "Name"
        },
        nodeAttributeValueLabel: {
            string: "Value"
        },
        nodeTextContentLabel: {
            string: "Text content"
        },
        nodeChildrenLabel: {
            string: "Children"
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
                xmlViewer: this,
                rootNode: xmlDoc.documentElement,
                l8n: this.l8n
            }
        };

        new Vue(vueOptions);
    }

    attributesArray(node) {
        var attribs = [];
        if(node.hasAttributes()) {
            var attrs = node.attributes;
            for (var i = 0; i < attrs.length; i++) {
                var attrib = {
                    name: attrs[i].name,
                    value: attrs[i].value
                };
                attribs.push(attrib);
            }
        }
            
        return attribs;
    }

    nodeTextContent(node) {
        var textContentNodes = [];
        var i = 0;
        var node;
        var nodes = node.childNodes;

        while(node = nodes[i++]) {
            if(node.nodeType === Node.TEXT_NODE) {
                textContentNodes.push(node);
            }
        }

        return textContentNodes;
    }

    childrenArray(node) {
        var childNodes = [];
        var i = 0;
        var node;
        var nodes = node.childNodes;

        while(node = nodes[i++]) {
            if(node.nodeType === Node.ELEMENT_NODE) {
                childNodes.push(node);
            }
        }

        return childNodes;
    }

    firstChildOfClass(node, className, excludedElement) {
        var children = this.childrenArray(node);

        for(const currentChild of children) {
            if(currentChild !== excludedElement && currentChild.classList.contains(className)) {
                return currentChild;
            }
        }

        return undefined;
    }

    firstSiblingOfClass(node, className) {
        var parent = node.parentElement;
        return this.firstChildOfClass(parent, className, node);
    }

    consoleLog(object) {
        console.log(object);
    }
}

XmlViewer.components = {};
XmlViewer.components.nodeDisplay = {
    props: ['xmlViewer', 'node', 'l8n'],
    computed: {
        //localized labels
        nodeNameLabel: function() {
            return this.l8n.interpolatel8nString("nodeNameLabel")
        },
        nodeAttributesLabel: function () {
            return this.l8n.interpolatel8nString("nodeAttributesLabel")
        },
        nodeAttributeNameLabel: function () {
            return this.l8n.interpolatel8nString("nodeAttributeNameLabel")
        },
        nodeAttributeValueLabel: function () {
            return this.l8n.interpolatel8nString("nodeAttributeValueLabel")
        },
        nodeTextContentLabel: function () {
            return this.l8n.interpolatel8nString("nodeTextContentLabel")
        },
        nodeChildrenLabel: function () {
            return this.l8n.interpolatel8nString("nodeChildrenLabel")
        },

        //computed arrays
        nodeTextContent: function() {
            return this.xmlViewer.nodeTextContent(this.node);
        },
        attributesArray: function() {
            return this.xmlViewer.attributesArray(this.node);
        },
        childrenArray: function() {
            return this.xmlViewer.childrenArray(this.node);
        }
    },
    methods : {
        toggleSection: function (labelNode, collapsableNode) {
            collapsableNode.classList.toggle("hidden");
            labelNode.classList.toggle("expanded");
            labelNode.classList.toggle("collapsed");
        },
        toggleSibling: function (node, siblingClass) {
            var sibling = this.xmlViewer.firstSiblingOfClass(node, siblingClass);
            this.toggleSection(node, sibling);
        },
        toggleNodeDetails: function (e) {
            this.toggleSibling(e.currentTarget, "node-details-wrapper");
        },
        toggleNodeAttributes: function (e) {
            this.toggleSibling(e.currentTarget, "node-attributes-list");
        },
        toggleNodeChildren: function (e) {
            this.toggleSibling(e.currentTarget, "node-children-list-wrapper");
        }
    },
    template: `
    <div class="node-display-wrapper">
        <div class="node-name expanded" v-on:click="toggleNodeDetails">
            <span class="node-name-label label">{{nodeNameLabel}}</span> <span class="node-name-text">{{node.tagName}}</span>
        </div>
        <div class="node-details-wrapper">
            <div class="node-attributes-wrapper node-details" v-if="node.hasAttributes()">
                <div class="node-attributes-label label expanded" v-on:click="toggleNodeAttributes">{{nodeAttributesLabel}}</div>
                <ul class="node-attributes-list">
                    <li v-for="attr in attributesArray">
                        <div class="node-attribute-name-wrapper">
                            <span class="node-attribute-name-label label">{{nodeAttributeNameLabel}}</span>
                            <span class="node-attribute-name">{{attr.name}}</span>
                        </div>
                        <div class="node-attribute-value-wrapper">
                            <span class="node-attribute-value-label label">{{nodeAttributeValueLabel}}</span>
                            <span class="node-attribute-value">{{attr.value}}</span>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="node-text-content-wrapper node-details" v-if="nodeTextContent.length > 0">
                <div class="node-text-content-label label">{{nodeTextContentLabel}}</div>
                <div class="node-text-content">
                    <div class="node-text-content-segment" v-for="seg in nodeTextContent">{{seg.nodeValue}}</div>
                </div>
            </div>
            <div class="node-children-wrapper node-details" v-if="node.children !== undefined">
                <div class="node-children-label label expanded" v-on:click="toggleNodeChildren">{{nodeChildrenLabel}}</div>
                <div class="node-children-list-wrapper">
                    <div class="node-child-wrapper" v-for="childNode in childrenArray">
                        <node-display v-bind:node="childNode" v-bind:xml-viewer="xmlViewer" v-bind:l8n="l8n"></node-display>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};