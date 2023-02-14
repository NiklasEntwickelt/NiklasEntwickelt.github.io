<!doctype html>
<html class="h-100" lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tagesbericht v2</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.3/font/bootstrap-icons.css">
    <link href="css/style.css" rel="stylesheet">
    <link rel="stylesheet" href="css/contextmenue.css" />
    <p style="visibility:hidden" id="download"></p>
    </head>


  <body id="element-to-print" class="d-flex flex-column h-100">
    <script src="js/contextmenue.js"></script>

    <div class="position-sticky top-0 end-0 p-0 m-0">
      <button class="position-absolute top-0 end-0 btn btn-primary" id="toggleHiddenElements"><i class="bi bi-toggle-on"></i></button>
    </div>
    </div>


    <div class="mt-2 p-1 dropshadow-black rounded container background-white text-center">
      <span class="h2 p-0 m-0">TAGESPROTOKOLL TOOL
        <div class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-secondary" style="font-size: 10px;">Version: Dev-2.6a</div>
      </span><br>
      <span class="h5" id="title">%Title</span><br>
    </div>

    <div class="mt-2 p-1 dropshadow-black rounded container background-white">
      <div class="row row-cols-1 row-cols-lg-3 g-3 g-lg-3 text-center">
        <div class="col">
          <img src="img/aunda.png">
        </div>
        <div class="col">
          <p class="h1 my-1 align-middle exportHidden" style="font-size:60px">X</p>
        </div>
        <div class="col">
          <img class="exportHidden" src="img/logo.png" height="100">
        </div>
      </div>
      
      <div class="row row-cols-1 row-cols-lg-2 g-2 g-lg-2 text-center">
        <div class="col">
          <div class="mt-1 exportHidden btn-group btn-group-sm" role="group" aria-label="Basic example" style="height: 90%">
              <button class="btn btn-success" type="button" id="exportPDF">PDF Exportieren</button>
              <button class="btn btn-danger" type="button" id="clear">Liste Leeren</button>
              <button class="btn btn-secondary" type="button" id="importPreset">Vorlage Importieren</button>
              <button class="btn btn-secondary" type="button" id="exportPreset">Vorlage Exportieren</button>
              <button class="btn btn-secondary" type="button" id="exportTasksAsText">Text Exportieren</button>
          </div>
        </div>
        <div class="col">
          <div class="mt-1 exportHidden btn-group btn-group-m" role="group" aria-label="Basic example" style="height: 90%">
            <button class="btn btn-success" type="button" id="cov19NBtn">Hinzufügen Negativen Corona Test</button>
            <button class="btn btn-danger" type="button" id="cov19PBtn">Hinzufügen Positiven Corona Test</button>
            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">Standart-Aufgaben</button>
          </div>
        </div>
      </div>
    </div>


  <div class="collapse" id="collapseExample">
    <div class="my-2 background-white dropshadowe black rounded container text-center exportHidden">
    <table class="table table-hover" id="defaultTimeTable">
      <thead>
        <tr><th colspan="3" class="fs-3">Standart Aufgaben <i class="bi bi-lock-fill"></i></th></tr>
        <tr>
          <th>Uhrzeit</th>
          <th>Tätigkeit</th>
          <th>Anmerkungen</th>
        </tr>
      </thead>
      <tbody class="table-group-divider" id="default-timeline">
        <tr class="">
          <td class=""><span contenteditable required role="textbox" class="form-control timeInput" id="inDefTime" scope="row"></span></td>
          <td class=""><span contenteditable required role="textbox" class="form-control" id="inDefText"></span></td>
          <td class=""><span contenteditable required role="textbox" class="form-control" id="inDefNote"></span></td>
        </tr>
      </tbody>
        <tbody class="exportHidden">
          <tr class="exportHidden">
            <td colspan="4">
              <div class="exportHidden d-grid gap-2">
                <button class="exportHidden btn btn-primary" id="addDefaultEntry" type="button">ADD Default (+)</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="my-2 dropshadow-black rounded container background-white text-center">
    <table class="table table-hover" id="timetable">
      <thead>
        <tr>
          <th>Uhrzeit</th>
          <th>Tätigkeit</th>
          <th>Anmerkungen</th>
        </tr>
      </thead>
      <tbody class="table-group-divider" id="timeline">
        
      </tbody>
      <tbody class="exportHidden">
        <tr class="exportHidden">
          <td colspan="4">
            <div class="exportHidden d-grid gap-2">
              <button class="exportHidden btn btn-primary" id="addEntry" type="button">ADD (+)</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>


  </div>

  <footer class="exportHidden footer mt-auto py-3 bg-dark">
    <div class="container">
      <span class="text-center align-items-center" style="width:200px;color:white">Copyright © Niklas Wollenberg</span>
    </div>
  </footer>

    <script type="text/javascript" src="https://www.jsdelivr.com/package/npm/pdfjs-dist"></script>
    <script type="text/javascript" src="pdfer.js"></script>


    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.1/html2pdf.bundle.min.js" integrity="sha512-vDKWohFHe2vkVWXHp3tKvIxxXg0pJxeid5eo+UjdjME3DBFBn2F8yWOE0XmiFcFbXxrEOR1JriWEno5Ckpn15A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa" crossorigin="anonymous"></script>

    <script src="js/code.js"></script>
  </body>
</html>
