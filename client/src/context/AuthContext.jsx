import { createContext, useState, useCallback, useEffect } from "react";
import { baseUrl, postRequest } from "../utils/services";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("User");
    setUser(JSON.parse(user));
  }, []);

  const [registerError, setRegisterError] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  //useCallback lets you memoize a callback function by preventing it from being recreated on every render (optimizes the function).
  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();

      //before request performed
      setRegisterLoading(true);

      //make sure there is not error in state
      setRegisterError(null);

      const response = await postRequest(
        `${baseUrl}/users/register`,
        JSON.stringify(registerInfo)
      );

      //after request performed
      setRegisterLoading(false);

      //we set error property in api if error accurs : return { error: true, message };
      if (response.error) {
        return setRegisterError(response);
      }
      if (response) {
        localStorage.setItem("User", JSON.stringify(response));
        setUser(response);
      }
    },
    [registerInfo]
  );

  const updateLoginInfo = useCallback((info) => {
    setLoginInfo(info);
  }, []);

  const loginUser = useCallback(
    async (e) => {
      e.preventDefault();
      setLoginLoading(true);
      setLoginError(null);

      const response = await postRequest(
        `${baseUrl}/users/login`,
        JSON.stringify(loginInfo)
      );

      setLoginLoading(false);

      if (response.error) {
        return setLoginError(response);
      }
      if (response) {
        localStorage.setItem("User", JSON.stringify(response));
        setUser(response);
      }
    },
    [loginInfo]
  );
  const logoutUser = useCallback(() => {
    localStorage.removeItem("User");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegisterInfo,
        registerUser,
        registerError,
        registerLoading,
        logoutUser,
        loginInfo,
        updateLoginInfo,
        loginUser,
        loginError,
        loginLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
