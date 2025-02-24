// export const baseUrl = "http://localhost:5000/api";
export const baseUrl = `${import.meta.env.VITE_BASE_URL}/api`;


// export const register = async (url, body) => {
export const postRequest = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  //response in json form
  const data = await response.json();

  //response has property of ok(boolean)
  if (!response.ok) {
    let message = "An error accured...";

    // example: if this comes  response.status(500).json(error) then :
    if (data?.message) {
      message = data.message;
    }
    // example: if this comes return response.status(400).json("Incorrect email or password...") then :
    else {
      message = data;
    }
    return { error: true, message };
  }

  return data;
};

export const getRequest = async (url) => {
  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    let message = "An error accured...";

    if (data?.message) {
      message = data.message;
    } else {
      message = data;
    }
    return { error: true, message };
  }

  return data;
};
