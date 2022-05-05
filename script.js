// define default options
var globals = {
    baseIMG: new Image(),
    threshold: 246,
    glowLayers: 15,
    glowRadius: 0.1,
    colorize: false,
    tintcolor: "#FFA000",
    showPreview: true,
};

function loadImage(imageURI, onLoad) {
    // loads image with URI imageURI and calls onLoad(). within the onLoad function, the keyword `this` can be used to reference the image object.
    var img = new Image();
    img.onload = onLoad;
    img.src = imageURI;
}

/*function displayProcessPreview(canvas, label) {
    // this function helps show and label different steps of the process.
    var rows = document.querySelectorAll("#processPreviews tr");
    var processPreview = new Image();
    processPreview.src = canvas.toDataURL();
    processPreview.style.width = "200px";
    var imagecell = document.createElement("td");
    imagecell.appendChild(processPreview);
    imagecell.style.padding = 0;
    var textcell = document.createElement("td");
    textcell.innerHTML = label;
    textcell.style.padding = 0;
    textcell.style.textAlign = "center";
    rows[0].appendChild(imagecell);
    rows[1].appendChild(textcell);
}*/

function mainProcess(inputData=globals) {
    document.body.style.cursor = "wait";
    
    if (typeof inputData == "string") {
        inputData = JSON.parse(inputData);
    }
    /*
    // clear old process previews, if any
    for (var tr of document.querySelectorAll("#processPreviews tr")) {
        tr.innerHTML = "";
    }
    */
    var canv = document.querySelector("canvas");
    var ctx = canv.getContext("2d");
    ctx.restore(); // if possible
    ctx.drawImage(inputData.baseIMG, 0, 0);
    ctx.save(); // save default context

    //displayProcessPreview(canv, "original image");

    // darken darkest pixels based on "threshold" input - isolates brightest pixels (hopefully, the light sources)
    isolateHighlights(ctx, inputData.threshold);

    //displayProcessPreview(canv, "light sources");

    loadImage(canv.toDataURL(), function() {
        // blur the light sources by different amounts and composite them together, resulting in a diffused light bloom effect
        for (var i = 0; i < inputData.glowLayers; i++) {
            // setting the blur amount based on a quadratic function gives a very nice, diffused-looking result
            var blurRadius = (i + 1) ** 2 * inputData.glowRadius;
            ctx.restore();
            ctx.save();
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.globalCompositeOperation = "screen";
            ctx.drawImage(this, 0, 0);
        }

        if (inputData.colorize) {
            // Override light color based on user input
            ctx.restore();
            ctx.save();
            ctx.fillStyle = inputData.tintcolor;
            ctx.globalCompositeOperation = "color";
            ctx.fillRect(0, 0, canv.width, canv.height);
            ctx.globalCompositeOperation = "soft-light";
            ctx.fillRect(0, 0, canv.width, canv.height);
        }
        else {
            // Otherwise, brighten bloom slightly to compensate
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.globalCompositeOperation = "soft-light";
            ctx.fillRect(0, 0, canv.width, canv.height);
        }

        //displayProcessPreview(canv, "lights + glow");

        // composite together glows + original image, resulting in final output
        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(inputData.baseIMG, 0, 0);
        
        document.body.style.cursor = "";
    });
    
}

//mainProcess(JSON.stringify(globals));

// GUI - uses a library that I built
ygui.buildGUIsection([
    /*{
        "label": "Base image",
        "type": "file",
        "id": "imgupload"
    },*/
    {
        "label": "Threshold",
        "type": "number",
        "id": "threshold",
        "attr": { "value": 246, "min": 0, "max": 254 }
    },
    {
        "label": "Glow layers",
        "type": "number",
        "id": "glowLayers",
        "attr": { "value": 15 }
    },
    {
        "label": "Glow radius",
        "type": "number",
        "id": "glowRadius",
        "attr": { "value": 0.1 }
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
        "attr": { "value": "#FFA000" }
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
// handle image upload
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