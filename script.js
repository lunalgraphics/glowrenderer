var globals = {
    baseIMG: new Image(),
    threshold: 222,
    glowLayers: 16,
    glowRadius: 1,
    colorize: false,
    tintcolor: "#FF5500",
    showPreview: true,
};

function loadImage(imageURI, onLoad) {
    var img = new Image();
    img.onload = onLoad;
    img.src = imageURI;
}

function mainProcess(inputData=globals, callback=function() {}, layerOnly=false) {
    document.querySelector("#waitCover").style.display = "block";
    if (typeof inputData == "string") {
        inputData = JSON.parse(inputData);
    }
    
    var canv = document.querySelector("canvas");
    var ctx = canv.getContext("2d");
    ctx.restore();
    ctx.drawImage(inputData.baseIMG, 0, 0);
    ctx.save();

    isolateHighlights(ctx, inputData.threshold);

    if (inputData.colorize) {
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "rgb(128, 128, 128)";
        ctx.globalCompositeOperation = "color";
        ctx.fillRect(0, 0, canv.width, canv.height);
        ctx.fillStyle = inputData.tintcolor;
        ctx.globalCompositeOperation = "multiply";
        ctx.fillRect(0, 0, canv.width, canv.height);
    }

    loadImage(canv.toDataURL(), function() {
        for (var i = 0; i < inputData.glowLayers; i++) {
            var blurRadius = (i + 1) ** 2 * inputData.glowRadius;
            ctx.restore();
            ctx.save();
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.globalCompositeOperation = "screen";
            ctx.drawImage(this, 0, 0);
        }

        if (layerOnly) {
            callback();
            document.querySelector("#waitCover").style.display = "none";
            return;
        }

        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(inputData.baseIMG, 0, 0);
        
        callback();
        document.querySelector("#waitCover").style.display = "none";
    });
    
}

ygui.buildGUIsection([
    {
        "label": "Threshold",
        "type": "number",
        "id": "threshold",
        "attr": { "value": 222, "min": 0, "max": 254 }
    },
    {
        "label": "Depth",
        "type": "number",
        "id": "glowLayers",
        "attr": { "value": 16 }
    },
    {
        "label": "Radius",
        "type": "number",
        "id": "glowRadius",
        "attr": { "value": 1 }
    },
    {
        "label": "Colorize?",
        "type": "checkbox",
        "id": "colorize",
        "attr": {}
    },
    {
        "label": "Color",
        "type": "color",
        "id": "tintcolor",
        "attr": { "value": "#FF5500", "disabled": "true" }
    },
    {
        "label": "Preview",
        "type": "checkbox",
        "id": "showPreview",
        "attr": { "checked": true }
    }
], document.querySelector("#guicontainer"));
for (var x of ["threshold", "glowLayers", "glowRadius", "colorize", "tintcolor", "showPreview"]) {
    var inputElem = document.querySelector("#" + x);
    inputElem.addEventListener("change", function(e) {
        var y = this.id;
        switch (this.getAttribute("type")) {
            case "number":
                globals[y] = parseFloat(this.value);
                break;
            case "checkbox":
                globals[y] = this.checked;
                break;
            default:
                globals[y] = this.value;
                break;
        }
        if (globals.showPreview) {
            mainProcess(globals);
        }
        else {
            mainProcess({
                baseIMG: globals.baseIMG,
                threshold: 255,
                glowLayers: 0,
                glowRadius: 0,
                colorize: false,
                tintcolor: "#000000"
            });
        }
    });
}
document.querySelector("#imgupload").addEventListener("change", function() {
    var file = this.files[0];
    var fR = new FileReader();
    fR.addEventListener("loadend", function(e) {
        var imageuri = e.target.result;
        
        var image = new Image();
        image.src = imageuri;
        globals.baseIMG = image;
        image.addEventListener("load", function() {
            document.querySelector("canvas").width = this.width;
            document.querySelector("canvas").height = this.height;
            mainProcess(globals);
            document.querySelector("#landingscreen").style.display = "none";
        });
    });
    fR.readAsDataURL(file);
});
document.querySelector("#uploadButton").addEventListener("click", function() {
    document.querySelector("#imgupload").click();
});

function canvDownload() {
    var a = document.createElement("a");
    a.href = document.querySelector("canvas").toDataURL();
    a.download = "superbloomed.png";
    a.click();
}
var exportpanel = document.createElement("div");
exportpanel.id = "exportpanel";
document.querySelector("#guicontainer").appendChild(exportpanel);
var fullexportbtn = document.createElement("button");
fullexportbtn.innerText = "Export Full Image";
exportpanel.appendChild(fullexportbtn);
fullexportbtn.addEventListener("click", function() {
    mainProcess(globals, canvDownload, false);
});
var br = document.createElement("br");
exportpanel.appendChild(br);
var layerexportbtn = document.createElement("button");
layerexportbtn.innerText = "Export Bloom Layer";
exportpanel.appendChild(layerexportbtn);
layerexportbtn.addEventListener("click", function() {
    mainProcess(globals, canvDownload, true);
});

document.querySelector("#colorize").addEventListener("change", function(e) {
    if (this.checked) {
        document.querySelector("#tintcolor").removeAttribute("disabled");
        document.querySelector("label[for=tintcolor]").style.opacity = "";
    }
    else {
        document.querySelector("#tintcolor").setAttribute("disabled", "true");
        document.querySelector("label[for=tintcolor]").style.opacity = "0.5";
    }
});
document.querySelector("label[for=tintcolor]").style.opacity = "0.5";