const uploadArea = document.querySelector("#uploadArea");
const dropZoon = document.querySelector("#dropZoon");
const loadingText = document.querySelector("#loadingText");
const fileInput = document.querySelector("#fileInput");
const previewImage = document.querySelector("#previewImage");
const fileDetails = document.querySelector("#fileDetails");
const uploadedFile = document.querySelector("#uploadedFile");
const uploadedFileInfo = document.querySelector("#uploadedFileInfo");
const uploadedFileName = document.querySelector(".uploaded-file__name");
const uploadedFileIconText = document.querySelector(
  ".uploaded-file__icon-text"
);
const uploadedFileCounter = document.querySelector(".uploaded-file__counter");
const toolTipData = document.querySelector(".upload-area__tooltip-data");

//
const fileTypes = ["xml"];

toolTipData.innerHTML = "xml";

dropZoon.addEventListener("dragover", function (event) {
  event.preventDefault();
  dropZoon.classList.add("drop-zoon--over");
});

dropZoon.addEventListener("dragleave", function (event) {
  dropZoon.classList.remove("drop-zoon--over");
});

dropZoon.addEventListener("drop", function (event) {
  event.preventDefault();
  dropZoon.classList.remove("drop-zoon--over");
  const file = event.dataTransfer.files[0];
  uploadFile(file);
});

dropZoon.addEventListener("click", function (event) {
  fileInput.click();
});

fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  uploadFile(file);
});

function uploadFile(file) {
  const fileReader = new FileReader();
  const fileType = file.type;
  const fileSize = file.size;

  if (fileValidate(fileType, fileSize)) {
    dropZoon.classList.add("drop-zoon--Uploaded");
    loadingText.style.display = "block";
    previewImage.style.display = "none";
    uploadedFile.classList.remove("uploaded-file--open");
    uploadedFileInfo.classList.remove("uploaded-file__info--active");

    fileReader.addEventListener("load", function (event) {
      setTimeout(function () {
        uploadArea.classList.add("upload-area--open");
        loadingText.style.display = "none";
        previewImage.style.display = "block";
        fileDetails.classList.add("file-details--open");
        uploadedFile.classList.add("uploaded-file--open");
        uploadedFileInfo.classList.add("uploaded-file__info--active");
      }, 500); // 0.5s

      //previewImage.setAttribute('src', "../img/album.jpg");
      uploadedFileName.innerHTML = file.name;
      progressMove();
      processXML(event.target.result)
    });

    fileReader.readAsText(file);
  } else {
    this;
  }
}

function processXML(xmlFile) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlFile, "text/xml");
  var albumes = xmlDoc.getElementsByTagName("album");
  for(let album of albumes){
    const albumAgregar = {
      "artist":album.getElementsByTagName('artist')[0].textContent,
      "title":album.getElementsByTagName('title')[0].textContent,
      "songs":album.getElementsByTagName('songs')[0].textContent,
      "year":album.getElementsByTagName('year')[0].textContent,
      "genre":album.getElementsByTagName('genre')[0].textContent,
      }
      agregarAlbum(albumAgregar)
  }
  
}

function progressMove() {
  let counter = 0;

  setTimeout(() => {
    let counterIncrease = setInterval(() => {
      if (counter === 100) {
        clearInterval(counterIncrease);
      } else {
        counter = counter + 10;
        uploadedFileCounter.innerHTML = `${counter}%`;
      }
    }, 100);
  }, 600);
}

function fileValidate(fileType, fileSize) {
  if (fileType === "application/xml" || fileType === "text/xml") {
    if (fileSize <= 10000000) {
      return true;
    } else {
      alert("El archivo debe tener un tamaño de 10 megabytes o menos.");
      return false;
    }
  } else {
    alert("Por favor, asegúrate de cargar un archivo de tipo XML.");
    return false;
  }
}


// base de datos

let db

function abrirBaseDeDatos() {
  // Intenta abrir la base de datos IndexedDB
  var solicitud = indexedDB.open("basealbumes", 1);

  // Maneja los posibles errores al abrir la base de datos
  solicitud.addEventListener("error", mostrarerror);
  solicitud.addEventListener("upgradeneeded", crearbd);
  solicitud.addEventListener("success", comenzar);
}

function mostrarerror(evento) {
  alert("Error: " + evento.code + " " + evento.message);
}

function comenzar(evento) {
  db = evento.target.result;
  obtenerTodosLosRegistros()
}


function crearbd(evento) {
  var basededatos = evento.target.result;
  var almacen = basededatos.createObjectStore("albumes", {
      keyPath: "title"
  });
  almacen.createIndex("BuscarNombre", "Nombre", { unique: false });
}

abrirBaseDeDatos()

function agregarAlbum(album) {
  const transaction = db.transaction(["albumes"], 'readwrite');
  var almacen = transaction.objectStore("albumes");

  const request = almacen.add(album); 

  // transaction.addEventListener("complete", (event) => {
  //   console.log(event)
  //   console.log('¡Álbum agregado correctamente!');
  // });
  
  request.onsuccess = (event) => {
    const albumKey = event.target.result; // La clave generada para el álbum
    console.log('¡Álbum agregado correctamente! Clave:', albumKey);

    // Ahora puedes recuperar el álbum utilizando la clave
    obtenerAlbumPorClave(albumKey);
  };
}

function obtenerAlbumPorClave(clave) {
  const transaction = db.transaction(["albumes"], 'readonly');
  const almacen = transaction.objectStore("albumes");

  const getRequest = almacen.get(clave);

  getRequest.onsuccess = (event) => {
    const albumRecuperado = event.target.result;
    console.log('Álbum recuperado:', albumRecuperado);
    addAlbumToTable(albumRecuperado)
    // Aquí puedes hacer lo que necesites con el álbum recuperado
  };

  getRequest.onerror = (event) => {
    console.error('Error al recuperar el álbum:', event.target.error);
  };
}


function obtenerTodosLosRegistros() {
  const transaction = db.transaction(["albumes"], 'readwrite');
  const objectStore = transaction.objectStore("albumes");
  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const registros = event.target.result;
    for (let album of registros){
      addAlbumToTable(album)
    }
  };

  request.onerror = (event) => {
    console.error("Error al obtener registros:", event.target.error);
  };
}


function addAlbumToTable(album){
  const tabla = document.getElementById('tabla')
  const tbody = tabla.querySelector("tbody")
  const fila = document.createElement("tr")
  fila.innerHTML = `
    <td>${album.artist}</td>
    <td>${album.title}</td>
    <td>${album.songs}</td>
    <td>${album.year}</td>
    <td>${album.genre}</td>
  `
  tbody.appendChild(fila)

  
}


