/*
 * Funciones genéricas para comunicarse con CodeIgniter.
 */

// ==========================================
// ERROR PERSONALIZADO
// ==========================================
export class ApiError extends Error {

    constructor(message, details = {}) {
        super(message);

        this.name = "ApiError";
        this.endpoint = details.endpoint ?? null;
        this.url = details.url ?? null;
        this.status = details.status ?? null;
        this.statusText = details.statusText ?? null;
        this.body = details.body ?? null;
        this.cause = details.cause ?? null;
    }
}


// ==========================================
// HEADERS GENERALES
// ==========================================
function getHeaders() {
    return {
        "Accept": "application/json",
        "Authorization": "Bearer C354r",
        "X-Api-Key": "C354r*11"
    };
}


// ==========================================
// LECTURA DEL CUERPO DE UN ERROR HTTP
// ==========================================
async function readErrorBody(response) {

    const contentType =
        response.headers.get("content-type") || "";

    try {

        if (contentType.includes("application/json")) {

            const data = await response.json();

            return (
                data.message ??
                data.error ??
                JSON.stringify(data)
            );
        }

        const text = await response.text();

        return text || null;

    } catch (parseError) {

        console.error(
            "[Tickets Widget] No se pudo leer el cuerpo del error:",
            parseError
        );

        return null;
    }
}


// ==========================================
// FETCH CON MANEJO DE ERRORES DETALLADO
// ==========================================
async function request(apiUrl, endpoint, options) {

    const url =
        apiUrl.replace(/\/$/, "") + endpoint;

    let response;

    try {

        response = await fetch(url, options);

    } catch (networkError) {

        console.error(
            `[Tickets Widget] No se pudo conectar con ${endpoint} ` +
            `(${url}):`,
            networkError
        );

        throw new ApiError(
            `No se pudo conectar con la API en "${endpoint}". ` +
            `Verifica tu conexión a internet, la configuración de ` +
            `CORS del servidor y que el certificado HTTPS sea válido.`,
            { endpoint, url, cause: networkError }
        );
    }

    if (!response.ok) {

        const body = await readErrorBody(response);

        console.error(
            `[Tickets Widget] Error HTTP ${response.status} ` +
            `(${response.statusText}) en ${endpoint}:`,
            body
        );

        throw new ApiError(
            body ||
            `Error HTTP ${response.status} (${response.statusText}) ` +
            `en "${endpoint}".`,
            {
                endpoint,
                url,
                status: response.status,
                statusText: response.statusText,
                body
            }
        );
    }

    try {

        return await response.json();

    } catch (parseError) {

        console.error(
            `[Tickets Widget] Respuesta no es JSON válido en ` +
            `${endpoint}:`,
            parseError
        );

        throw new ApiError(
            `La API respondió con un formato inesperado en ` +
            `"${endpoint}".`,
            { endpoint, url, cause: parseError }
        );
    }
}


// ==========================================
// GET
// ==========================================
export async function apiGet(apiUrl, endpoint) {

    return await request(
        apiUrl,
        endpoint,
        {
            method: "GET",
            headers: getHeaders()
        }
    );
}


// ==========================================
// POST
// ==========================================
export async function apiPost(apiUrl, endpoint, body) {

    return await request(
        apiUrl,
        endpoint,
        {
            method: "POST",
            headers: {
                ...getHeaders(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );
}


// ==========================================
// UPLOAD
// ==========================================
export async function apiUpload(apiUrl, endpoint, formData) {

    return await request(
        apiUrl,
        endpoint,
        {
            method: "POST",
            headers: getHeaders(),
            body: formData
        }
    );
}
