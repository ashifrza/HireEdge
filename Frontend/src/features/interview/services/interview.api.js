import { api } from "../../../lib/api";

export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);
  if (resumeFile) formData.append("resume", resumeFile);

  const response = await api.post("/api/interview/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 35000,
  });
  return response.data;
};

export const getInterviewReportById = async (interviewId) => {
  const response = await api.get(`/api/interview/report/${interviewId}`);
  return response.data;
};

export const getAllInterviewReports = async () => {
  const response = await api.get("/api/interview/");
  return response.data;
};

export const deleteInterviewReport = async (id) => {
  const response = await api.delete(`/api/interview/report/${id}`);
  return response.data;
};

export const generateResumePdf = async ({ interviewReportId }) => {
  const response = await api.post(
    `/api/interview/resume/pdf/${interviewReportId}`,
    null,
    {
      responseType: "blob",
      // Resume generation includes an AI request and PDF rendering, so it needs
      // a larger timeout than ordinary API calls.
      timeout: 120000,
    },
  );
  return {
    blob: response.data,
    mode: response.headers["x-resume-mode"] || "enhanced",
  };
};

export const saveReportProgress = async (interviewId, progress) => {
  const response = await api.patch(`/api/interview/report/${interviewId}/progress`, progress);
  return response.data;
};

export const createPracticeSession = async (reportId, settings) => {
  const response = await api.post(`/api/interview/report/${reportId}/sessions`, settings);
  return response.data;
};

export const submitPracticeAnswer = async (sessionId, payload) => {
  const response = await api.post(`/api/interview/sessions/${sessionId}/answers`, payload);
  return response.data;
};

export const completePracticeSession = async (sessionId) => {
  const response = await api.post(`/api/interview/sessions/${sessionId}/complete`);
  return response.data;
};

export const getPracticeSession = async (sessionId) => {
  const response = await api.get(`/api/interview/sessions/${sessionId}`);
  return response.data;
};

export const getInterviewProgress = async () => {
  const response = await api.get("/api/interview/progress");
  return response.data;
};
