//GLOBAL SETUP VARIABLES
let debug = false;



let today = new Date();
const optionsTitle = {year: 'numeric', month: 'numeric', day: 'numeric' };
let titleToday = today.toLocaleDateString('de-DE',optionsTitle);
const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
today = today.toLocaleDateString('de-DE',options);
let teilnehmerTemplate = "%Teilnehmer%";
let teilnehmer = teilnehmerTemplate;
if(localStorage.getItem("teilnehmer") != null) {
    teilnehmer = localStorage.getItem("teilnehmer");
}

document.title = `Tagesbericht-${titleToday}-${teilnehmer}`;



window.addEventListener("DOMContentLoaded",() => {
//ON LOADED DOM


    document.querySelector("#title").innerHTML = `Ausbildung und Arbeit plus @ MOIN - Motiviert = Intigriert - <span id="teilnehmer" contenteditable>${teilnehmer}</span>, <span contenteditable>${today}</span>`;

    if(localStorage.getItem("timeline") != null) {
        try {
            console.log("Loading data from Save...");
            removeAllEntries();
            var timeline = localStorage.getItem("timeline");
            var defaultTimeline = localStorage.getItem("default-timeline");
        
            document.querySelector("#timeline").innerHTML = timeline;
            document.querySelector("#default-timeline").innerHTML = defaultTimeline;

            updateTimeline();
        } catch (err) {console.error("shit",err);} 
        console.log("Successfully loaded data from Saved LocalStorage");
        
    } else 
        addEntry(null,null,null,"first");

    nameInput();
    buttonHandler();
});

window.addEventListener("beforeunload",() => {
    let timeline = document.querySelector("#timeline").innerHTML;
    let defaultTime = document.querySelector("#default-timeline").innerHTML;
    console.log("Saving items in Localstorage...")
    localStorage.setItem("timeline",timeline);
    localStorage.setItem("default-timeline",defaultTime);
});




const buttonHandler = (callback) => {
    if(debug == true)
        console.log("Button Handler Started");

    //Activate Button Listener
    document.querySelector("#addEntry").onclick = () => {addEntry(null,null,null,"last")}
    document.querySelector("#addDefaultEntry").onclick = () => {addDefaultEntry(document.querySelector("#inDefTime").innerText,document.querySelector("#inDefText").innerText,document.querySelector("#inDefNote").innerText,"last")}
    document.querySelector("#exportPDF").onclick = () => {
        if(!document.querySelector("#addEntry").hasAttribute("disabled"))
            exportPDF()
    }
    document.querySelector("#clear").onclick = () => {removeAllEntries()}
    document.querySelector("#exportPreset").onclick = () => {exportTemplate()}
    document.querySelector("#importPreset").onclick = () => {importTemplate()}
    document.querySelector("#cov19NBtn").onclick = () => {addCovidTest(0)}
    document.querySelector("#cov19PBtn").onclick = () => {addCovidTest(1)}
    document.querySelector("#teilnehmer").oninput = () => {nameInput()}
    document.querySelector("#exportTasksAsText").onclick = () => {exportTasksAsText()}
    document.querySelectorAll(".timeInput").forEach((value,index,element) => {value.onblur = () => {validateTime(value)}})
    document.querySelector("#toggleHiddenElements").onclick = (event) => {toggleHiddenElements(event)}
    
    try {
        if(debug == true)
            console.log("Button Handler finished with no errors");
    } catch (err) {
        if(debug == true)
            console.log("Button Handler was aborted due to an error");
    }

    if(callback != null)
        callback();
}

let disableArgument;
const addButtonDisableArgument = (buttonID,...arguments) => {

    let disableArguments = [];
    
    if(document.querySelector(`#${buttonID}`).getAttribute("disableArgument") != null)
        disableArguments.push(document.querySelector(`#${buttonID}`).getAttribute("disableArgument"));    

    for(let argument of arguments)
        disableArguments.push(argument);
downlo
    document.querySelector(`#${buttonID}`).setAttribute("disableArgument",disableArguments)
  

    updateButtonState(buttonID);
}

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

const nameInput = () => {

    let attr = document.createAttribute("disabled")
    if(document.querySelector("#teilnehmer").innerText != teilnehmerTemplate) {
        document.querySelector("#teilnehmer").style.backgroundColor = null;
        updateButtonState("exportPDF");
    } else {
        document.querySelector("#teilnehmer").style.backgroundColor = "red";
        updateButtonState("exportPDF");

        
    };

    teilnehmer = localStorage.setItem("teilnehmer",document.querySelector("#teilnehmer").innerText);
}

//creating
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

const addEntry = (uhrzeit,text,anmerkung,position) => {
    
    if(uhrzeit == null)
        uhrzeit = "";
    if(text == null)
        text = "";
    if(anmerkung == null)
        anmerkung = "";

    let tr = createElement("tr",null,null,["timeline-item"]) 
    tr.innerHTML = 
    `
    <td class="timeline-item-time"><span contenteditable required role="textbox" class="overflow-hidden form-control timeInput" scope="row">${uhrzeit}</span></td>
    <td class="timeline-item-text"><span contenteditable required role="textbox" class="overflow-hidden form-control" scope="row">${text}</span></td>
    <td class="timeline-item-note"><span contenteditable required role="textbox" class="overflow-hidden form-control" scope="row">${anmerkung}</span></td>
    <td class="deleteBtn">
        <div class="row g-0">
            <button class="btn btn-danger exportHidden col-3"><i class="bi bi-trash"></i></button>
            <button class="btn btn-secondary exportHidden col-3"><i class="bi bi-arrow-bar-up"></i></button>
            <button class="btn btn-secondary exportHidden col-3"><i class="bi bi-arrow-bar-down"></i></button>
        </div>
    </td>`;

    if(position == "first") 
        document.querySelector("#timeline").insertBefore(tr,document.querySelector("#timeline").firstChild);
    else if(position == "default" || position == "last")
        document.querySelector("#timeline").appendChild(tr);
    else
        document.querySelector("#timeline").insertBefore(tr,document.querySelector(position));


    //insert number to button for deletion and query based on positon in timeline
    buttonHandler();
    updateTimeline();
    return tr;

}

const addDefaultEntry = (uhrzeit,text,anmerkung,position) => {
    
    if(uhrzeit == null)
        uhrzeit = "";
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
        <button class="btn btn-secondary exportHidden"><i class="bi bi-trash"></i> </button>
        </div> 
    </td>
    `;

    if(position == "first") 
        document.querySelector("#default-timeline").insertBefore(tr,document.querySelector("#default-timeline").firstChild);
    else if(position == "default" || position == "last")
        document.querySelector("#default-timeline").appendChild(tr);
    else
        document.querySelector("#default-timeline").insertBefore(tr,document.querySelector(position));


    //insert number to button for deletion and query based on positon in timeline
    buttonHandler();
    updateTimeline();
    return tr;

}

//UPDATE ORDER UTIL
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

//empty list
const removeAllEntries = () => {
    if(document.querySelectorAll(".timeline-item").length >= 1) {
        for(let el of document.querySelectorAll('.timeline-item')) {
            el.remove();
        }
    };
}


//PDF EXPORT
const hideElements = () => {
    for(let element of document.querySelectorAll(".exportHidden")) {
        element.style.display = "none";
    }
    document.body.style.backgroundImage = 'url()';
    return true
}

const showElements = () => {
    for(let element of document.querySelectorAll(".exportHidden")) {
        element.style.display = null;
    }
    document.body.style.backgroundImage = '';
    return true
}

const exportPDF = () => {
    hideElements();
    var pdf_content = document.getElementById("element-to-print");
    var options = {
        margin:       1,
        filename:     `Tagesbericht ${new Date().getDate()}.${new Date().getUTCMonth()+1}.${new Date().getFullYear()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
    html2pdf(pdf_content,options);
    showElements();
}





//RIGHT CLICK MENUE
/*
window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    try {
        let path;
        if(event.path[0].parentNode.classList.contains("timeline-item")) {
            path = event.path[0].parentNode;

        } else if(event.path[0].parentNode.parentNode.classList.contains("timeline-item")) {
            path = event.path[0].parentNode.parentNode;

        } else {return}
        
        console.log(event.path[0])
#

    } catch(err) {
        console.log(err);return;
    }


})
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

  const importTemplate = () => {

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

//UTIL

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

String.prototype.replaceAt = function(index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }
 
    var chars = this.split('');
    chars[index] = replacement;
    return chars.join('');
}

String.prototype.insert = function(index, string) {
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index);
  }

  return string + this;
};

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
            if((parseInt(input.innerText[0]) == 1) || parseInt(input.innerText[0]) == 2) {
                input.innerText += "00";   
                
                
            } else {
                input.innerText = input.innerText.insert(0,"0");
                input.innerText += "0";   
            }
                
        break;
        case 3:

            if((input.innerText[0] == "0")) {
                console.log("DEBUG triggered 0 phase");
                input.innerText = input.innerText += "0";
                break;
            }
            
            
            //step one add a buffer zero
              input.innerText = input.innerText += "0";

            if((input.innerText[0] == "1") || (input.innerText[0] == "2")) {
                //the first 2 chars are hours
                //GREAT! DO NOT TOUCH THIS
            } else {
                //this is only written with 1 hour and 2 minute symbols
                input.innerText = input.innerText.slice(0,3);
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

    //correct nonlogical outcomes. 

    /*

    15:00 ist ein problem!!!!! BUG

    if(parseInt(input.innerText[2]) >= 6) {
        input.innerText = input.innerText.replaceAt(2,"5");
        input.innerText = input.innerText.replaceAt(3,"9");
    }
  

    if(parseInt(input.innerText[0]) >= 3) {
        input.innerText = input.innerText.replaceAt(0,"2");
    }

    if(parseInt(input.innerText[0]) != 0 && parseInt(input.innerText[1]) >= 4) {
        input.innerText = input.innerText.replaceAt(1,"3");
    }
  
        */
    input.innerText = setDot(input);




    //103 => 10:30 - 3 digits, first number
    //1430 => 14:30 - 4 digits just add spacer ":"

    

    //Autofill times and dates
    /*
       if(!input.innerText.includes(":")) {

        if(input.innerText.length == 1)
        input.innerText = input.innerText.insert(0,"0");


        if(input.innerText.length == 2) {
            input.innerText = input.innerText.substring(0,2) + ":00" + input.innerText.substring(2);
        } else
        if(input.innerText.length == 3) {
            input.innerText = input.innerText.substring(0,2) + ":0" + input.innerText.substring(2);
        } else
        {
            input.innerText = input.innerText.substring(0,2) + ":" + input.innerText.substring(2);
        }
        
        if(input.innerText.length == 1) {input.innerText = "";} 
    } else {

        if(input.innerText.length == 3) {
            input.innerText = input.innerText.substring(0,3) + "00";
        } else
        if(input.innerText.length == 4) {
            input.innerText = input.innerText.substring(0,4) + "0" ;
        }        
    }
    */

    let regex = new RegExp("^([0-1][0-9]|2[0-3]):([0-5][0-9])$");
    if(!regex.test(input.innerText)) {
        input.parentElement.parentElement.style.backgroundColor = "red";
        updateButtonState("exportPDF");
    } else {
        input.parentElement.parentElement.style.backgroundColor = null;
        updateButtonState("exportPDF");
    }


    return;

    
}



const removeEntry = (timelineIndex) => {
    if(timelineIndex == null) return;
    document.querySelector(`#timeline-${timelineIndex}`).remove();updateTimeline();
}



const exportTasksAsText = () => {
    let exportString = [];
    document.querySelectorAll(".timeline-item").forEach((index) => {for(let e of index.children) {
        if(!e.classList.contains("deleteBtn")) {exportString.push(e.innerText)}
    }});


    let ion = 1;
    let myWindow = window.open("", "MsgWindow", "width=200,height=300");


    myWindow.document.write(`Hiermit übermittle ich den aktuellen Tagesbericht vom <b>${today}</b> <br><br>`);
    myWindow.document.write(`<div class="overflow-hidden" style="background:#626473;padding: 5px;border-radius:20px;color: white;border: 2px solid black">`);
    exportString.forEach((value,index) => {
        
        if(ion == 3) {
            if(value.length >= 1) {myWindow.document.write(`<div style="background: red">Anmerkungen:</div> ${value} <br>`);ion = 0;}
            else {myWindow.document.write(`<br>`);ion = 0;}
        } else
        {
            myWindow.document.write(`${value} `)
        }

            ;ion++})
    myWindow.document.write(`</div>`);
    setClipboard(myWindow.document.body.innerHTML);


}


function setClipboard(text) {
    const type = "text/html";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
        () => {
        /* success */
        },
        () => {
        /* failure */
        }
    );
}


const moveCell = (timelineIndexFrom,timelineIndexTo) => {
    /*
        Create a new Element at choosen Spot.
        Update List Sorting to include new Element


        


        Loop through old data copy all innerHTML of each field into new field

        

    */



        document.querySelector("#timeline-1").before(document.querySelector(`#timeline-${document.querySelector("#timeline").children.length}`))
        updateTimeline();
}



/*

TODOS AND IDEAS


DEFAULTTASKS 
- Implement and auto set them on page load
- no dupes for auto load

*/