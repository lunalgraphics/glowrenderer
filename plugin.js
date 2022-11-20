if ((new URLSearchParams(location.search)).get("isPhotopeaPlugin") == "yessir") {
    document.querySelector("#uploadButton").style.display = "none";
    document.querySelector("#exportpanel").innerHTML = "";
    var finishButton = document.createElement("button");
    finishButton.innerText = "Add to Document";
    document.querySelector("#exportpanel").appendChild(finishButton);
    finishButton.addEventListener("click", function() {
        mainProcess(globals, async function() {
            await Photopea.runScript(window.parent, `app.open("${document.querySelectorAll("canvas")[1].toDataURL()}", null, true);`);
            await Photopea.runScript(window.parent, `app.activeDocument.activeLayer.blendMode = "screen";`);
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