//GLOBAL SETUP VARIABLES
let debug = false;
let saveSchedulerRunning = false;

//Get the Current Date and format it so it can be used in titles
let today = new Date();
const optcellsTitle = {year: 'numeric', month: 'numeric', day: 'numeric' };
let titleToday = today.toLocaleDateString('de-DE',optcellsTitle);
const optcells = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
today = today.toLocaleDateString('de-DE',optcells);

//format title elements
let userNameTemplate = "%userName%";
let userName = userNameTemplate;
if(localStorage.getItem("userName") != null) {
    userName = localStorage.getItem("userName");
}

let companyTemplate = "%Firma%";
let company = companyTemplate;
if(localStorage.getItem("company") != null) {
    company = localStorage.getItem("company");
}

//fix the webregister title
document.title = `Tagesbericht-${titleToday}-${userName}`;

//Offscreen Export - Color schemes
let baseTextColor = "black";
let baseTextShadowColor = "white 2px 2px 2px";

let exportBackgroundColor = "#023047";
let timeCellColor = "#dee2e6";
let timeCellTextColor = baseTextColor;
let timeCellTextShadowColor = baseTextShadowColor;
let timeCellBorderColor = "transparent";

let taskCellColor = "#dee2e6";
let taskCellTextColor = baseTextColor;
let taskCellTextShadowColor = baseTextShadowColor;
let taskCellBorderColor = "transparent";

let commentCellColor = "#dee2e6";
let commentCellTextColor = baseTextColor;
let commentCellTextShadowColor = baseTextShadowColor;
let commentCellBorderColor = "transparent";


console.log("EEEEK2");

//Once page content is loaded
window.addEventListener("DOMContentLoaded",() => {
    
    //Create an Automatic filled out Banner
    document.querySelector("#title").innerHTML = `<span id="company" contenteditable>${company}</span> - <span id="userName" contenteditable>${userName}</span>, <span contenteditable id="date">${today}</span>`;

    //Grab previous stored localdata and repopulate the table with it
    if(localStorage.getItem("timeline") != null) {
        try {
            console.log("Loading data from Save...");
            createToast("saveNotification","Daten werden aus Speicher geladen..","")
            removeAllEntries();
            var timeline = localStorage.getItem("timeline");
            var defaultTimeline = localStorage.getItem("default-timeline");
        
            document.querySelector("#timeline").innerHTML = timeline;
            document.querySelector("#default-timeline").innerHTML = defaultTimeline;

            updateTimeline();
        } catch (err) {console.error("An Error has occured ",err);} 
        console.log("Successfully loaded data from Saved LocalStorage");
        
    } else 
        addEntry(null,null,null,"first");

    //Check if Information are valid otherwise act accordingly
    validateTitleInformation();
    
    //enable functions for buttons
    buttonHandler();

    //enable Autosave
    startSaveScheduler();
});


//Save data from both normal timeline and the default-Tasks timeline into a localstorage
const saveData =  (cause) => {
    let timeline = document.querySelector("#timeline").innerHTML;
    let defaultTime = document.querySelector("#default-timeline").innerHTML;
    localStorage.setItem("timeline",timeline);
    localStorage.setItem("default-timeline",defaultTime);
    
    switch(cause) {
        case "autosave":
            console.log("Savinvg timeline in Localstorage...")
        break;
        default:
            console.log("Saving timeline in Localstorage...")
        break;
    }
    
}

//Before you down shutdown the website, load everything into the Storage
window.addEventListener("beforeunload",() => {
    saveData();
});




const buttonHandler = (callback) => {
    //if debug mode is triggered the sheet will send commands on what is doing
    if(debug == true)
        console.log("Button Handler Started");

    //Activate Listener on Elements    
    try {
        document.querySelector("#addEntry").onclick = () => {addEntry(null,null,null,"last")}
        document.querySelector("#addDefaultEntry").onclick = () => {addDefaultEntry(document.querySelector("#inDefTime").innerText,document.querySelector("#inDefText").innerText,document.querySelector("#inDefNote").innerText,"last")}
        document.querySelector("#exportPDF").onclick = () => {  
            if(!document.querySelector("#addEntry").hasAttribute("disabled"))
                exportPDF()
            else
                createToast("warning","Knopf gerade deaktiviert");
            }
        document.querySelector("#clear").onclick = () => {resetTimeline()}
        document.querySelector("#exportPreset").onclick = () => {exportTemplate()}
        document.querySelector("#importPreset").onclick = () => {importTemplate()}
        document.querySelector("#cov19NBtn").onclick = () => {addCovidTest(0)}
        document.querySelector("#cov19PBtn").onclick = () => {addCovidTest(1)}
        document.querySelector("#userName").oninput = () => {validateTitleInformation()}
        document.querySelector("#company").oninput = () => {validateTitleInformation()}
        document.querySelector("#exportTasksAsText").onclick = () => {exportTasksAsText()}
        document.querySelector("#exportTasksAsRawText").onclick = () => {exportTasksAsRawText()}
        document.querySelectorAll(".timeInput").forEach((value,index,element) => {value.onblur = () => {validateTime(value);sortTimelineByTime()}})
        document.querySelector("#toggleHiddenElements").onclick = (event) => {toggleHiddenElements(event)}        
        document.querySelector("#addDefaultTaskstoTimeline").onclick = () => {addDefaultTasksToTimeline()}        
    
        const myOffcanvas = document.getElementById('exportAreaContainer')
        myOffcanvas.addEventListener('hide.bs.offcanvas', event => {
          showElements();
        })

        if(debug == true)
            console.log("Button Handler finished with no errors");
        } catch (err) {
            console.error("Button Handler was aborted due to an error");
            stop();
            //TODO: Crash page
        }

    //send towards callback
    if(callback != null)
        callback();
}

//utility function
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//Disable a buttons use
let disableArgument;
const addButtonDisableArgument = (buttonID,...arguments) => {

    let disableArguments = [];
    
    if(document.querySelector(`#${buttonID}`).getAttribute("disableArgument") != null)
        disableArguments.push(document.querySelector(`#${buttonID}`).getAttribute("disableArgument"));    

    for(let argument of arguments)
        disableArguments.push(argument);

    document.querySelector(`#${buttonID}`).setAttribute("disableArgument",disableArguments)
  

    updateButtonState(buttonID);
}

//Enable a buttons use
const removeButtonDisableArgument = (buttonID,...arguments) => {

    let disableArgument = [];
    if(document.querySelector(`#${buttonID}`).hasAttribute("disableArgument"))
        disableArgument = [document.querySelector(`#${buttonID}`).getAttribute("disableArgument")];
    else {
        throw new Error("nothing is working.. its empty");
        return;
    } 

    console.log("aqquired..",disableArgument)

    for(let argument of arguments) {
        disableArgument = disableArgument.filter(e => e !== argument); 
    }

    document.querySelector(`#${buttonID}`).setAttribute("disableArgument",disableArgument)
  

    updateButtonState(buttonID);
}

//TODO replace old code for switching states
const updateButtonState = (buttonID) => {
    return;

    let attr = document.createAttribute("disabled");
    if(document.querySelector(`#${buttonID}`).getAttribute("disableArgument") != null) {
        document.querySelector(`#${buttonID}`).style.opacity = null;
        document.querySelector(`#${buttonID}`).disabled = false
    } else {
        document.querySelector(`#${buttonID}`).style.opacity = "0.25";
        document.querySelector(`#${buttonID}`).setAttributeNode(attr);
    };
}

//validate information from title card, username (and company) set field to red when empty
const validateTitleInformation = () => {

    let attr = document.createAttribute("disabled")
    if(document.querySelector("#userName").innerText != userNameTemplate) {
        document.querySelector("#userName").style.backgroundColor = null;
        updateButtonState("exportPDF");
    } else {
        document.querySelector("#userName").style.backgroundColor = "red";
        updateButtonState("exportPDF");
    };

    //TODO : ADD CHECKSUM FOR COMPANY AND FIX COLOR ISSUE-

    userName = localStorage.setItem("userName",document.querySelector("#userName").innerText);
    company = localStorage.setItem("company",document.querySelector("#company").innerText);

}

//Add Output for a Covid Test
const addCovidTest = async (ergebnis) => {
    let entry;
    if(!ergebnis) {
        entry = addEntry("09:00","Corona(Covid-19) Test","Ergebniss Negativ","first");
        entry.style.backgroundColor = "green";
    } else {
        entry = addEntry("09:00","Corona(Covid-19) Test","Ergebniss Positiv","first");
        entry.style.backgroundColor = "red";
    }
}

//Add new Entry towards "timeline"
const addEntry = (uhrzeit,text,anmerkung,positcell,isLocked) => {
    
    //if space is null its empty!
    if(uhrzeit == null)
        uhrzeit = "";
    if(text == null)
        text = "";
    if(anmerkung == null)
        anmerkung = "";

    let tr = createElement("tr",null,null,["timeline-item"]) 
    tr.innerHTML = isLocked ? 
    `
    <td class="timeline-item-time"><span contenteditable required role="textbox" class="overflow-hidden form-control timeInput" scope="row">${uhrzeit}</span></td>
    <td class="timeline-item-text"><span contenteditable required role="textbox" class="overflow-hidden form-control" scope="row">${text}</span></td>
    <td class="timeline-item-note"><span contenteditable required role="textbox" class="overflow-hidden form-control" scope="row">${anmerkung}</span></td>
    <td class="deleteBtn" style="opacity: 0.5">
    <div class="row g-0">
        <button class="btn btn-danger exportHidden col-9 disabled"><i class="bi bi-trash"></i></button>
        </div>
    </td>
    ` : `
    <td class="timeline-item-time"><span contenteditable required role="textbox" class="overflow-hidden form-control timeInput" scope="row">${uhrzeit}</span></td>
    <td class="timeline-item-text"><span contenteditable required role="textbox" class="overflow-hidden form-control" scope="row">${text}</span></td>
    <td class="timeline-item-note"><span contenteditable required role="textbox" class="overflow-hidden form-control" scope="row">${anmerkung}</span></td>
    <td class="deleteBtn">
        <div class="row g-0">
            <button class="btn btn-danger exportHidden col-9"><i class="bi bi-trash"></i></button>
        </div>
    </td>
    `;

    //Quirky positionspaces
    if(positcell == "first") 
        document.querySelector("#timeline").insertBefore(tr,document.querySelector("#timeline").firstChild);
    else if(positcell == "default" || positcell == "last")
        document.querySelector("#timeline").appendChild(tr);
    else
        document.querySelector("#timeline").insertBefore(tr,document.querySelector(positcell));


    //insert number to button for deletcell and query based on positon in timeline
    buttonHandler();
    updateTimeline();
    return tr;

}

//Remove specified entry
const removeEntry = (timelineIndex) => {
    if(timelineIndex == null) return;
    document.querySelector(`#timeline-${timelineIndex}`).remove();updateTimeline();
}

//addEntry towards defaulttimeline
//TODO merge branch with normal addEntry, make it differenciate.
const addDefaultEntry = (uhrzeit,text,anmerkung,positcell) => {
    
    if(uhrzeit == null || uhrzeit == undefined || uhrzeit.length == 0) {
        uhrzeit = "";
        createToast("warning","Standartaufgabe konnte nicht generiert werden!","Bitte eine Uhrzeit angeben!","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAulBMVEX////84QAAAADXwADUugD7+uv/5wD83wD/5QDVvQD/6QD/4wD/6wDp0AD///rexgD+86/97Xr96V3+8aL95C394yLz2QD//vUyLAD95UBXTgB+cADjywDv1ABgVgDCrgCShADv5ar/+df+98r+9r787IP9508XFACKfAD++t+4pQALCQAhHgCfjwCwnQB0ZwA/OABKQgDt3n7m01LbxjUcGQD96mv07srm14AoJADr3ZL+7pDbxibhz1yWpMSsAAADzUlEQVRoge2ZeXeiMBTFzUSQgGutuGEtdlHraFul02Xa7/+1BpDlhSwEzZwz50zvn8X8fL6bmxdtrfatf1iLbu/iotdd6Ce3+5co0WW/rZd9M0BAgxud7H4DUWr0/x5bJ/2WYYf0Wz3s4YBlh30faoHf8dgI9XSwF3w2Qjo2/L0Ifn8+uytiI9Q9lw3cdGzTdU3T0edpL0PZrelouRytWqYuT9c5++HHUZu5nf1xfRZ8nGLMlB1qntU+PofdTbPpuJsc/jNLbOMMT4fZ5ze3P4B2edtP9zTPpjWB8EfrfE9hNp8g/DmHn5zTcY5wKPgEwE/0FJ60wrac6KkBmoKsKYRfm/CZcQKcOmnNawjfUvC76uwFNX6EWzFqTHVP6ZPW3EH43KIeVvbUp+emVYfwjkM9RBWn9dCllzsehLcK8Iqe7gurnRaEz4rwSjldzwqrETy4RsWHCFW5gh3Y5SCiE5N5eq9+ffSZwpENInrVZB6r53TYYQtvXoH0s3D1s/fNZdc2H0H6bfa5qqfr4jaO2wLyv2N7jlTP3oBTOD1DLc4L0KUK2+cVjqx5GVzlVm188gqn8s99d6SS0z1/Kcj/hvvuSMHTNREsdZcp/EXALvc08EQrX1L4uxBecvb6ddFntkZZ+rl+xpJ6amBPYBYys4hOudv8KJmne8L5bpXAsxG94gU0kcTTVyIsHNkrafpTic/eAAsLB/nnpz+R0FNfUjjIf11sKBJ6OsTijoe7hWQBlcIFnu4JM3iBnE4Kl3y8SL/4bko6DvK/YcZzQTxPA2nhef5H8q5wz16fYPkaM4noE2/IQbFnr4FJS76mmcz/5zI46+le3vEI/iwZz7QKnr6SssKRneR/K8vQUQ3a0wCXdDzc6FhpJ8aiPA3dZO9BTOnxNfqhvHBE5dQg5YWHMlu73UyJDT3dE1KWjFgO/M1CrszTMJtYdZGyEk/bASblHY9UoXI0bqduqnQ8dNTbbTuySUGpf8wmVtgqkeIpOmmoFh95+hYWXhLOWHYyoTlXf756x20oup9B5cOCf1XkyIg7rhK6fIbKpj+lbtwV+UGewFeV4b3ap6Kf+R1aOv2hBjWsvFmSYbEUXfhYxXCVtiCr9R6PUE/VzwSuYmhIb+ym062rzka1Q0RXfLFp26r9jjSufRDlplfV7/hIVC69ktzXeMKpZbSaHDdIDsWQrnweqaGRV/ejY/EQ07HnNpCjRcideZgcaumZG4lgbYpQyRRd6+Smyn5aNwLNdPIJf7b/0NuUj8JF1P/CpK5D+MvnfbkYGhqk579q3/r/9Adiskvl+eWpZQAAAABJRU5ErkJggg==");
        return;
    }



    if(text == null)
        text = "";
    if(anmerkung == null)
        anmerkung = "";

    let tr = createElement("tr",null,null,["default-timeline-item"]) 
    tr.innerHTML = 
    `
    <td class=""><span role="textbox" class="form-control timeInput" scope="row">${uhrzeit}</span></td>
    <td class=""><span role="textbox" class="form-control" scope="row">${text}</span></td>
    <td class=""><span style="min-height: 35px" role="textbox" class="form-control" scope="row">${anmerkung}</span></td>
    <td class="default-deleteBtn d-grid gap-2">
        <div class="container">
        <button class="btn btn-danger exportHidden"><i class="bi bi-trash"></i> </button>
        </div> 
    </td>
    `;

    if(positcell == "first") 
        document.querySelector("#default-timeline").insertBefore(tr,document.querySelector("#default-timeline").firstChild);
    else if(positcell == "default" || positcell == "last")
        document.querySelector("#default-timeline").appendChild(tr);
    else
        document.querySelector("#default-timeline").insertBefore(tr,document.querySelector(positcell));


    //clear inputs
    document.querySelector("#inDefTime").innerText = "";
    document.querySelector("#inDefText").innerText = "";
    document.querySelector("#inDefNote").innerText = "";

    //insert number to button for deletcell and query based on positon in timeline
    buttonHandler();
    updateTimeline();
    return tr;

}

//Update the Timeline based on position 
const updateTimeline = (callback) => {
    document.querySelectorAll(".timeline-item").forEach((element,index) => {element.id = `timeline-${index+1}`})
    document.querySelectorAll(".timeline-item").forEach((element,index) => { //loop through all timeline elements
        for(let element2 of element.children) { //loop through children of timeline-1 => 
            if(element2.classList.contains("deleteBtn")) {element2.children[0].children[0].id = `deleteBtn-${index+1}`;element2.children[0].children[0].onclick = () => {document.querySelector(`#timeline-${index+1}`).remove();updateTimeline()}}
            if(element2.classList.contains("timeline-item-note")) {element2.id = `timeline-item-note-${index+1}`}
            if(element2.classList.contains("timeline-item-time")) {element2.id = `timeline-item-time-${index+1}`}
            if(element2.classList.contains("timeline-item-text")) {element2.id = `timeline-item-text-${index+1}`;
            element2.oninput = () => {
                document.querySelector(`#timeline-item-note-${index+1}`).style.height = document.querySelector(`#timeline-item-text-${index+1}`).style.height       
            }
        }
    }
    })

    //Default timeline
    document.querySelectorAll(".default-timeline-item").forEach((element,index) => {if(index == 0) { element.style.borderTop = "2px dotted black"};element.style.borderLeft = "4px solid rgba(0,255,65)";element.style.borderRadius = "10px"})
    document.querySelectorAll(".default-timeline-item").forEach((element,index) => {element.id = `default-timeline-${index+1}`})
    document.querySelectorAll(".default-timeline-item").forEach((element,index) => {
        for(let element2 of element.children) {if(element2.classList.contains("default-deleteBtn")) {element2.children[0].children[0].id = `default-deleteBtn-${index+1}`;element2.children[0].children[0].onclick = () => {document.querySelector(`#default-timeline-${index+1}`).remove();updateTimeline()}}}
    })

    buttonHandler();
    if(callback != null) callback();
}


//Remove All Entries from timeline with nested delete loop
const removeAllEntries = () => {
    if(document.querySelectorAll(".timeline-item").length >= 1) {
        for(let el of document.querySelectorAll('.timeline-item')) {
            el.remove();
        }
    };
}

const resetTimeline = () => {
    //remove all tasks
    removeAllEntries();

    //get default tasks to be addedult
    addDefaultTasksToTimeline();


}

const addDefaultTasksToTimeline = () => {
    if(document.querySelector("#default-timeline").children.length == 0) {createToast("warning","Fehler","Es sind keine Einträge vorhanden, die kopiert werden könnten")}
    let position = 1;
    for(let child of document.querySelector("#default-timeline").children) {
        if(position == 1) {position++;continue};
        addEntry(child.children[0].innerText,child.children[1].innerText,child.children[2].innerText,"last",false);
        position++;
    }
    sortTimelineByTime();
}


//Make all elements hidden which have .exportHidden class tag, so you can make elements are not exported.
const hideElements = () => {
    createToast("notice","Präsentationsmodus","Steuerelemente wurden unsichtbar geschalten",null);
    for(let element of document.querySelectorAll(".exportHidden")) {
        element.style.display = "none";
    }
    document.body.style.backgroundImage = 'url()';
    return true
}

//Show all elements again
const showElements = () => {
    createToast("notice","Operationsmodus","Steuerelemente wurden sichtbar geschalten",null);
    for(let element of document.querySelectorAll(".exportHidden")) {
        element.style.display = null;
    }
    document.body.style.backgroundImage = '';
    return true
}

//toggle visibility
const toggleHiddenElements = (event) => {
    if(event.target.getAttribute("visibilityState") == "shown") {
        event.target.getAttribute("hidden");
        showElements();
        event.target.setAttribute("visibilityState","hidden");  

    } else {
        event.target.getAttribute("shown");
        hideElements();
        event.target.setAttribute("visibilityState","shown");
    }

    
}

//Export timeline to PDF - Scuffed
//Feature remains but as CLS only for now
const exportPDF = () => {
    hideElements();
    var pdf_content = document.body;
    var optcells = {
        margin:       1,
        filename:     `Tagesbericht ${new Date().getDate()}.${new Date().getUTCMonth()+1}.${new Date().getFullYear()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientatcell: 'portrait' }
      };
    html2pdf(pdf_content,optcells);
    showElements();
}

/*
let bundle = [];
const bundleRecursive = (element) => {
     
    const bundleUp = (element) =>  {

        if(element.children.length >= 1)
        for (let children of element.children) {
            bundleUp(children);
        }
        bundle.push(element);
    }

    bundleUp(element);
}

//Export Timeline as Json Template
const exportTemplate = () => {
    if(document.querySelectorAll(".timeline-item").length < 1) {return};
     saveToFile();
}

Bundle timeline and default timeline into json components
 function bundleToJSON() {
     let html = document.querySelector("#timeline").innerHTML;
     let defaultTimeline = document.querySelector("#default-timeline").innerHTML;

     bundleRecursive(document.querySelectorAll(".GIP"));

     let arr = [];
     arr.push(html);
     arr.push(defaultTimeline);
    document.getElementById('download').value = JSON.stringify(arr)
   }
*/

//TEMPLATES
const exportTemplate = () => {
    if(document.querySelectorAll(".timeline-item").length < 1) {return};
     saveToFile();
}

function bundleToJSON() {
    let html = document.querySelector("#timeline").innerHTML;
    let defaultTimeline = document.querySelector("#default-timeline").innerHTML;

    let arr = [];
    arr.push(html);
    arr.push(defaultTimeline);

    document.getElementById('download').value = JSON.stringify(arr)
  }

function saveToFile() {
    bundleToJSON();
    var jsonObjectAsString = document.getElementById('download').value;
  
    var blob = new Blob([jsonObjectAsString], {
      //type: 'application/json'
      type: 'octet/stream'
    });
    console.log(blob);
  
    var anchor = document.createElement('a')
    anchor.download = "export.json";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.innerHTML = "download"
    anchor.click();
  
    console.log(anchor);
  
    document.getElementById('download').append(anchor)
   
  }

  const otherimportTemplate = () => {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
    var file = e.target.files[0];
    input.remove(); 
    //console.log(file);

    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(file);

    }

    input.click();
}

function onReaderLoad(event){
    removeAllEntries();
    var arr = JSON.parse(event.target.result);
    let timeline = arr[0]; 
    let defaultTimeline = arr[1]; 

    document.querySelector("#timeline").innerHTML = timeline;
    document.querySelector("#default-timeline").innerHTML = defaultTimeline;
    updateTimeline();
}


  //Import an JSON element to filereader
  const importTemplate = () => {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
    var file = e.target.files[0];
    input.remove(); 

    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(file);

    }

    input.click();
}

//Element has been uploaded, deal with it internaly
function onReaderLoad(event){
    //clear timeline, unpack content, and replace timeline, then update new order
    removeAllEntries();
    var arr = JSON.parse(event.target.result);
    let timeline = arr[0]; 
    let defaultTimeline = arr[1]; 

    document.querySelector("#timeline").innerHTML = timeline;
    document.querySelector("#default-timeline").innerHTML = defaultTimeline;
    updateTimeline();
}

//create elements utility
const createElement = (elementType,parent,innerHTML,classArray) => {
    if(elementType == null) throw Error("Cannot create Element missing critical arguments","elementType is missing");
    
    let element = document.createElement(`${elementType}`);
    if(element.innerHTML != null)
        element.innerHTML = innerHTML;
    element.classList.add(...classArray);
    if(parent == null && element != null)
        return element;
    else
        return parent.appendChild(element);
}

//replace at utility
String.prototype.replaceAt = function(index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }
 
    var chars = this.split('');
    chars[index] = replacement;
    return chars.join('');
}

//string insert utility
String.prototype.insert = function(index, string) {
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index);
  }

  return string + this;
};

const sortTimelineByTime = () => {
    sortTable("timeline");    
}

//validate all of the time input, and autocorrect inputs
const validateTime = (input) => {

    //ignore empty spaces
    if(input.innerText.length == 0) return;

    //reduce field inputs to to numbers
   input.innerText = input.innerText.replace(/[^0-9]/g,"");

    if(input.innerText.includes("-")) {
        input.innerText = input.innerText.replace("-","");
    }

    const setDot = (input) => {
        if(input.innerText.length != 4) return;
        return input.innerText.insert(2,":");
    }

    //recalculate time properly?
    //check length of input

    switch(input.innerText.length) {
        case 1:
            //is length is only 1 = it may be a single hour

            input.innerText = input.innerText.insert(0,"0");

            input.innerText += "0";
            input.innerText += "0";

        break;
        case 2:
            //
            if((parseInt(input.innerText[0]) >= 0) && parseInt(input.innerText[0]) <= 2) {
                input.innerText += "00";   
                
                
            } else {
                input.innerText = input.innerText.insert(0,"0");
                input.innerText += "0";   
            }
                
        break;
        case 3:

            if((input.innerText[0] == "0") || (input.innerText[0] == "1") || (input.innerText[0] == "2")) {
                input.innerText = input.innerText += "0";
            } else {
                input.innerText = input.innerText.insert(0,"0");
            }


        break;
        case 4:
            //let it pass through!
        break;
        default:
            if(input.innerText.length >= 5)
                input.innerText = input.innerText.slice(0,4);  
            else
                input.innerText = "0000";
        break;
    }
    
    input.innerText = setDot(input);

    //temporary fix for coloration problem... TODO find a more permanent fix
   let regex = new RegExp("^([0-1][0-9]|2[0-3]):([0-5][0-9])$");
    if(!regex.test(input.innerText)) {
        if(input.parentElement.parentElement.getAttribute("isDyed")) {
            input.parentElement.parentElement.setAttribute("oldBG",input.parentElement.parentElement.style.backgroundColor)
        }
        input.parentElement.parentElement.setAttribute("isDyed",true)
        input.parentElement.parentElement.style.backgroundColor = "red";
        updateButtonState("exportPDF");
    } else {
        if(input.parentElement.parentElement.getAttribute("isDyed")) {
            input.parentElement.parentElement.style.backgroundColor = input.parentElement.parentElement.getAttribute("oldBG");
            input.parentElement.parentElement.setAttribute("isDyed",false)
        }
        updateButtonState("exportPDF");
    }


    return;
    
}


//New Export method, export timeline as Rich text/html into your clipboard
const exportTasksAsText = () => {
    let exportString = [];
    document.querySelectorAll(".timeline-item").forEach((index) => {for(let e of index.children) {
        if(!e.classList.contains("deleteBtn")) {exportString.push(e.innerText)}
    }});

    let cell = 1;
    let textExport = document.querySelector("#exportArea")
    textExport.innerHTML = null;
    hideElements()
    
    textExport.innerHTML += `Hiermit übermittle ich den aktuellen Tagesbericht vom <b>${document.querySelector("#date").innerText}</b> <br><br>`;
    textExport.innerHTML += `<hr><div class="" style="text-align:center;border-radius: 10px;background-color:${exportBackgroundColor};color:white"> ${document.querySelector("#company").innerText} von ${document.querySelector("#userName").innerText}</div>`;
    textExport.innerHTML +=  `
    <table class="overflow-hidden" style="width:95%;margin:10px;border-radius:10px;color: white;background-color:${exportBackgroundColor}">
    <thead style="margin:10px">
    <th style="text-align:center">Uhrzeit</th>
    <th style="text-align:center">Aufgabe</th>
    <th style="text-align:center">Anmerkungen</th>
            </thead>
            <tbody id="textExportWrapper"></tbody>            
            `;      

    let textExportWrapper = document.querySelector("#textExportWrapper");
    
    exportString.forEach((value,index) => {
        
    switch(cell){
        //this is the time cell
        case 1:
            textExportWrapper.innerHTML += `
            <tr>
                <td id="popul1" style="text-align:center;text-shadow: ${timeCellTextShadowColor};color: ${timeCellTextColor};background: ${timeCellColor};border: 1px solid ${timeCellBorderColor};border-radius:2px;padding: 2px;margin: 50px 0px 50px 0px"> ${value} </td>
                <td id="popul2" style="text-align:center;text-shadow: ${taskCellTextShadowColor};color: ${timeCellTextColor};background: ${taskCellColor};border: 1px solid ${taskCellBorderColor};border-radius:2px;padding: 2px;margin: 50px 0px 50px 0px"></td>
                <td id="popul3" style="text-align:center;text-shadow: ${timeCellTextShadowColor};color: ${timeCellTextColor};background: ${timeCellColor};border: 1px solid ${commentCellBorderColor};border-radius:2px;padding: 2px;margin: 50px 0px 50px 0px"></td>
            </tr>
            `;
        break;
            
        //this is the task cell
        case 2:
            document.querySelector("#popul2").innerHTML = `${value}`;    
        break;
            
            //this is the comment cell
            case 3:
                if(value.length >= 1) {
                    document.querySelector("#popul3").innerHTML = `${value}`;    
                    document.querySelector("#popul1").removeAttribute("id")    
                    document.querySelector("#popul2").removeAttribute("id")    
                    document.querySelector("#popul3").removeAttribute("id")    

                    
                    cell = 0;
                } else {
                    document.querySelector("#popul1").removeAttribute("id")    
                    document.querySelector("#popul2").removeAttribute("id")    
                    document.querySelector("#popul3").removeAttribute("id")    

                    cell = 0
                }
            break;     
    
        //throw an error, this should not happen.
        default:
        console.error(`An Error occured during Exporting Table as Formatted Text... <br> The index "cell" is out of bounds`)
        //try and correct the export timeline on your own
        cell = 0;
        break;
    }       

    cell++;
    })
 
    setClipboard(textExport.innerHTML);
    
    
    var myOffcanvas = document.getElementById('exportAreaContainer')
    var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas)
    bsOffcanvas.show();

}


//RAW EXPORT

//Export it as plain Text, try and format it the right way.
const exportTasksAsRawText = () => {
    let exportString = [];
    document.querySelectorAll(".timeline-item").forEach((index) => {for(let e of index.children) {
        if(!e.classList.contains("deleteBtn")) {exportString.push(e.innerText)}
    }});

    let cell = 1;
    let textExport = document.querySelector("#exportArea")
    textExport.innerHTML = null;
    hideElements()
    
    textExport.innerHTML += `${document.querySelector("#date").innerText}`;
    textExport.innerHTML += `${document.querySelector("#company").innerText} von ${document.querySelector("#userName").innerText}`;

        
    exportString.forEach((value,index) => {
        
    switch(cell){
        //this is the time cell
        case 1:
            textExport.innerHTML += `<br> ${value}: `;
        break;
            
        //this is the task cell
        case 2:
            textExport.innerHTML += ` -${value}- `;
        break;
            
            //this is the comment cell
            case 3:
                if(value.length >= 1) {
                    textExport.innerHTML += ` | Anmerkungen: ${value}: `;  
                
                    cell = 0;
                } else {
                
                    cell = 0
                }
            break;     
    
        //throw an error, this should not happen.
        default:
        console.error(`An Error occured during Exporting Table as Formatted Text... <br> The index "cell" is out of bounds`)
        //try and correct the export timeline on your own
        cell = 0;
        break;
    }       

    cell++;
    })
 
    setClipboard(textExport.innerHTML);
    
    
    var myOffcanvas = document.getElementById('exportAreaContainer')
    var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas)
    bsOffcanvas.show();

}

//utility set text to clipboard
function setClipboard(text) {  
    const type = "text/html";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
        () => {
        /* Success */
            createToast("notice2","Tabelle wurde in Zwischenablage kopiert","")
        },
        () => {
        /* failure */
            createToast("notice2","Konnte Tabelle nicht in Zwischenablage kopieren","")
        }
    );
}



const startSaveScheduler = async () =>  {
    //check if already running 

    if(saveSchedulerRunning) {
       console.info("Save Scheduler is already running, not restarting.")
        return -1;
    } else {
        console.log("Save Scheduler started, running...")
    }

    saveSchedulerRunning = true;
    let saveSchuler = 0;

    const SaveScheduler = async () => {
        await wait(1000*60)
        saveData("autosave");
        createToast("autosave","Timeline wird im Browser gespeichert...","")
        SaveScheduler()
    }

    SaveScheduler();
}


/*
TODOS AND IDEAS


DEFAULTTASKS 
- Implement and auto set them on page load
- no dupes for auto load
*/



/*
var timelineSortBuffer = [];
const sortTimelineByTime = () => {
    timelineSortBuffer = [];

    let timeline = document.querySelector("#timeline");

    if(timeline.children.length >= 1)
    for (let child of timeline.children) {
        //timeline => TR
        for(let subchild of child.children) {
            //TR => Element containers, time, text, comment, button
            if(subchild.classList.contains("timeline-item-time"))
                timelineSortBuffer.push(subchild);
            }
        }
        
        timelineSortBuffer.forEach((value,index) => {
            timelineSortBuffer[index].innerHTML = value.innerHTML.replace(":","");
        });

        console.log(timelineSortBuffer.innerHTML);
        timelineSortBuffer.sort(timelineSortBuffer.innerHTML);

        timelineSortBuffer.forEach((value,index) =>  {
            timelineSortBuffer[index].innerHTML = value.innerHTML.insert(2,":");
        });

        console.log(timelineSortBuffer);
}

*/



const sortTable = (sortString) => {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById(sortString);
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /*Loop through all table rows (except the
      first, which contains table headers): EDITED IT NOW LOOPS THROUGH*/
      for (i = 0; i < (rows.length -1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false;
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("TD")[0];
        y = rows[i + 1].getElementsByTagName("TD")[0];
        //check if the two rows should switch place:
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

/*
    elements =
    {
        element:"<element>" ,elementID:elementID
    }

*/
