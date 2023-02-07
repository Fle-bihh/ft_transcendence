import axios from "axios";

// export const deleteAllCookies = () => {
//     const cookies = document.cookie.split(";");

//     for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i];
//         const eqPos = cookie.indexOf("=");
//         const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     }
// }

axios.interceptors.response.use(
    response => { return response; },
    error => {
        if (error.response.data['statusCode'] === 401) {
            window.localStorage.clear();
            // deleteAllCookies();
            window.open("http://localhost:3000/login", '_self')
        }
        return error;
    }
)