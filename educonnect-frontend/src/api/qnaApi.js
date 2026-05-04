import apiClient from "./apiClient";


export const saveQuestion = async (data) => {
  const res = await apiClient.post("/question/save-question", data);
  return res;
}

export const myQuestions = async () => {
  const res = await apiClient.get("/question/my-questions");
  console.log(res);
  return res;
}


export const editQuestion = async (data)  => {
  const res = await apiClient.put("/question/edit-question", data);
  return res;
}


export const searchQuestions = async (data) => {
  const res = await apiClient.post("/question/search-question", data);
  return res;
};

export const fetchQuestionById = async (id) => {
  const res = await apiClient.get("/question/get-by-id?id="+id);
  return res;
};

export const postAnswer = async (data) => {
  const res = await apiClient.post("/answer/post-answer", data);
  return res;
};

export const voteQuestion = async (data) => {
  const res = await apiClient.post("/question/vote-question", data);
  return res;
};

export const voteAnswer = async (data) => {
  const res = await apiClient.post("/answer/vote-answer", data);
  return res;
};