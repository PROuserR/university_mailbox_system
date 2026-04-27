import axios from "axios";

const myAPI = axios.create({
    baseURL: "https://universitymailbox.runasp.net/api",
    withCredentials: true // for cookies
});

export default myAPI;