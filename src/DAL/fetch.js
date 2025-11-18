import { invokeApi } from "../Utils/InvokeApi";

export const fetchcategorylist = async () => {
  const reqObj = {
    path: "/category/live",
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchDashboard = async () => {
  const reqObj = {
    path: "/stats/dashboard",
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchDashboardChart = async () => {
  const reqObj = {
    path: "/views/get/count",
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchallroleslist = async (page, rowsPerPages, searchQuery) => {
  const reqObj = {
    path: `/roles/list?limit=${rowsPerPages}&page=${page}&keyword=${searchQuery}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchallActiveroleslist = async (page, rowsPerPages, searchQuery) => {
  const reqObj = {
    path: `/roles/activeList?limit=${rowsPerPages}&page=${page}&keyword=${searchQuery}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchalluserlist = async (page, rowsPerPages, searchQuery) => {
  const reqObj = {
    path: `/user/list?limit=${rowsPerPages}&page=${page}&keyword=${searchQuery}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchallStocklist = async (page, rowsPerPages, searchQuery) => {
  const reqObj = {
    path: `/stock/list?limit=${rowsPerPages}&page=${page}&keyword=${searchQuery}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchallExpenselist = async (page, rowsPerPages, searchQuery) => {
  const reqObj = {
    path: `/expense/list?limit=${rowsPerPages}&page=${page}&keyword=${searchQuery}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchSaleslist = async (page, rowsPerPages, searchQuery) => {
  const reqObj = {
    path: `/bill/salesactivity?limit=${rowsPerPages}&page=${page}&keyword=${searchQuery}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};


export const fetchallBilllist = async (page, rowsPerPages, searchQuery) => {
  const reqObj = {
    path: `/bill/list?limit=${rowsPerPages}&page=${page}&keyword=${searchQuery}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

// New API functions for POS Billing System
export const fetchProductsList = async (page = 1, limit = 50, keyword = "") => {
  const reqObj = {
    path: `/stock/list?page=${page}&limit=${limit}&keyword=${keyword}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

 

export const searchBillById = async (billId) => {
  const reqObj = {
    path: `/bill/${billId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};
 