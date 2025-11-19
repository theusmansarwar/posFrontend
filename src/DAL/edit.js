import { invokeApi } from "../Utils/InvokeApi";

export const updateRole = async (id,data) => {
 
  const reqObj = {
    path: `/roles/update/${id}`,
    method: "PUT",
    headers: {      Authorization: `Bearer ${localStorage.getItem("Token")}`,},
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateUser = async (id,data) => {
 
  const reqObj = {
    path: `/user/update/${id}`,
    method: "PUT",
    headers: {      Authorization: `Bearer ${localStorage.getItem("Token")}`,},
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateStock = async (id,data) => {
 
  const reqObj = {
    path: `/stock/update/${id}`,
    method: "PUT",
    headers: {      Authorization: `Bearer ${localStorage.getItem("Token")}`,},
    postData: data,
  };
  return invokeApi(reqObj);
};
export const updateExpense = async (id,data) => {
 
  const reqObj = {
    path: `/expense/update/${id}`,
    method: "PUT",
    headers: {      Authorization: `Bearer ${localStorage.getItem("Token")}`,},
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateBill = async (billNo, returnData) => {
  const reqObj = {
    path: `/bill/${billNo}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
      "Content-Type": "application/json",
    },
    postData: returnData,
  };
  return invokeApi(reqObj);
};

export const updateReport = async (billNo, returnData) => {
  const reqObj = {
    path: `/bill/report/${billNo}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
      "Content-Type": "application/json",
    },
    postData: returnData,
  };
  return invokeApi(reqObj);
};

export const updatePendingAmount = async (billNo, returnData) => {
  const reqObj = {
    path: `/bill/pendingAmount/${billNo}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
      "Content-Type": "application/json",
    },
    postData: returnData,
  };
  return invokeApi(reqObj);
};

