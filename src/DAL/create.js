import { invokeApi } from "../Utils/InvokeApi";

export const createnewuser = async (data) => {

  const reqObj = {
    path: "/user/create",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};


export const createRole = async (data) => {

  const reqObj = {
    path: "/roles/add",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};


export const createUser = async (data) => {

  const reqObj = {
    path: "/user/create",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createStockM = async (data) => {

  const reqObj = {
    path: "/stock/create",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};
export const createNewStock = async (id,data) => {

  const reqObj = {
    path: `/stock/addnew/${id}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};
export const createExpense = async (data) => {

  const reqObj = {
    path: "/expense/add",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createBill = async (billData) => {
  const reqObj = {
    path: "/bill/create",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
      "Content-Type": "application/json",
    },
    postData: billData,
  };
  return invokeApi(reqObj);
};

export const createReport = async (billData) => {
  const reqObj = {
    path: "/bill/report",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
      "Content-Type": "application/json",
    },
    postData: billData,
  };
  return invokeApi(reqObj);
};
