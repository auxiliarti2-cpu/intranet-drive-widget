// REEMPLAZA ESTO con tu Client ID real de GCP
const CLIENT_ID = 'TU_CLIENT_ID_DE_GCP';
// Scopes deben coincidir con los que definiste en GCP
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email';

let accessToken = '';

// 1. Manejar la respuesta de la credencial de Google (tras el inicio de sesión)
function handleCredentialResponse(response) {
    // Almacena el token de acceso
    accessToken = response.access_token;
    document.getElementById('status').innerText = '¡Sesión Iniciada!';
    document.querySelector('.g_id_signin').style.display = 'none'; // Ocultar botón de login
    
    // Iniciar el cliente de la API
    gapi.load('client', initClient);
}

// 2. Inicializar el cliente de la API de Google
function initClient() {
    gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
    }).then(function () {
        // Cargar el módulo de Drive
        return gapi.client.load('drive', 'v3');
    }).then(function () {
        // Si ya hay un token, cargamos las carpetas
        if (accessToken) {
            listDriveFolders();
        }
    }, function(error) {
        document.getElementById('drive-content').innerHTML = `Error al cargar la API: ${error.details}`;
    });
}

// 3. Llamar a la Drive API para listar las carpetas
function listDriveFolders() {
    // Petición al API para obtener solo carpetas de la raíz
    gapi.client.drive.files.list({
        'q': "'root' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed=false",
        'fields': 'files(id, name, webViewLink)',
        'pageSize': 20
    }).then(function(response) {
        const files = response.result.files;
        const container = document.getElementById('drive-content');
        container.innerHTML = ''; // Limpiar contenido anterior

        if (files && files.length > 0) {
            files.forEach(function(file) {
                const folderDiv = document.createElement('div');
                folderDiv.className = 'folder-item';
                // Enlace que abre la carpeta en Google Drive
                folderDiv.innerHTML = `<a href="${file.webViewLink}" target="_blank">📁 ${file.name}</a>`;
                container.appendChild(folderDiv);
            });
        } else {
            container.innerHTML = '<p>No se encontraron carpetas en tu unidad raíz.</p>';
        }
    }, function(error) {
        document.getElementById('drive-content').innerHTML = `Error al obtener carpetas: ${error.result.error.message}`;
    });
}

// Asegúrate de que las funciones estén disponibles globalmente
window.handleCredentialResponse = handleCredentialResponse;
window.initClient = initClient;
