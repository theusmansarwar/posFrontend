import { invokeApi } from "../Utils/InvokeApi";

export const deleteAllRoles = async (data) => {
  const reqObj = {
    path: `/roles/multipleDelete`,
    method: "DELETE", // Ensure correct capitalization
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  
  return invokeApi(reqObj);
};

export const deleteAllUsers = async (data) => {
  const reqObj = {
    path: `/user/multipleDelete`,
    method: "DELETE", // Ensure correct capitalization
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  
  return invokeApi(reqObj);
};

export const deleteAllStock = async (data) => {
  const reqObj = {
    path: `/stock/deleteMultiple`,
    method: "DELETE", // Ensure correct capitalization
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  
  return invokeApi(reqObj);
};

export const deleteAllExpense = async (data) => {
  const reqObj = {
    path: `/expense/multipleDelete`,
    method: "DELETE", // Ensure correct capitalization
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  
  return invokeApi(reqObj);
};

export const deleteAllBills = async ({ ids }) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return { status: 400, message: "No bills selected" };
  }

  try {
    const results = await Promise.all(
      ids.map((id) =>
        invokeApi({
          path: `/bill/${id}`,
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        })
          .then((res) => ({ id, success: true }))
          .catch((err) => ({ id, success: false, err }))
      )
    );

    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      return {
        status: 500,
        message: `${failed.length} bill(s) failed to delete`,
        details: failed,
      };
    }

    return { status: 200, message: "All selected bills deleted successfully" };
  } catch (error) {
    console.error("deleteAllBills error:", error);
    return { status: 500, message: "Something went wrong", error: error.message };
  }
};


