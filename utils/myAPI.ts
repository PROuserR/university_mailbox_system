import axios from "axios";

const myAPI = axios.create({   
    // baseURL: "https://universitymailbox.runasp.net/api",
     baseURL: "https://localhost:7236/api",
    withCredentials: true // for cookies
});

export default myAPI;