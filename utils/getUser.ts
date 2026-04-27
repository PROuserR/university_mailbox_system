import myAPI from "./myAPI";

const checkIfUserLoggedIn = async () => {
    try {
        const res = await myAPI.get("/auth/me");
        if (res.status === 200) {
            return true;
        }
    } catch (error) {
        return false;
    }
};

export default checkIfUserLoggedIn;