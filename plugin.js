if ((new URLSearchParams(location.search)).get("isPhotopeaPlugin") == "yessir") {
    document.querySelector("#uploadButton").style.display = "none";
    document.querySelector("#exportpanel").innerHTML = "";
    var finishButton = document.createElement("button");
    finishButton.innerText = "Add to Document";
    document.querySelector("#exportpanel").appendChild(finishButton);
    finishButton.addEventListener("click", function() {
        mainProcess(globals, async function() {
            var layersCount = (await Photopea.runScript(window.parent, `app.echoToOE(app.activeDocument.layers.length);`))[0];
            var layerCheckInterval = async function() {
                var newLayersCount = (await Photopea.runScript(window.parent, `app.echoToOE(app.activeDocument.layers.length);`))[0];
                if (newLayersCount == layersCount + 1) {
                    await Photopea.runScript(window.parent, `app.activeDocument.activeLayer.blendMode = "scrn";`);
                    await Photopea.runScript(window.parent, `app.activeDocument.activeLayer.name = "SuperBloom";`);
                    return;
                }
                else setTimeout(layerCheckInterval, 50);
            };
            layerCheckInterval();
            await Photopea.runScript(window.parent, `app.open("${document.querySelectorAll("canvas")[1].toDataURL()}", null, true);`);
        }, true);
    });
    
    Photopea.runScript(window.parent, "app.activeDocument.saveToOE('png')").then(function(data) {
        var buffer = data[0];
        var imageuri = "data:image/png;base64," + base64ArrayBuffer(buffer);
        
        var img = new Image();
        img.src = imageuri;
        globals.baseIMG = img;
        img.addEventListener("load", function() {
            document.querySelector("canvas").width = this.width;
            document.querySelector("canvas").height = this.height;
            mainProcess(globals);
            document.querySelector("#landingscreen").style.display = "none";
        });

        globals.imgname = "thecoolness";
    });
}